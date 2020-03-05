import {getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import {Store} from "vuex";
import cloneDeep from 'lodash.clonedeep';
import groupBy from 'lodash.groupby';

let syncEventMediationPaused = false;
const syncEventMetadata: ISyncEventMetadata[] = [];

export interface ISyncEvent {
    module: string;
    name: string;
    payload: any;
}

interface ISyncEventMetadata {
    type: string;
    event: string;
    module: string;
}

export interface IPushRequest<V> {
    localVersion: V;
    changelog: ISyncEvent[];
}

export interface ISyncAdapter<V> {
    push(request: IPushRequest<V>): Promise<V>;
    pull(localVersion: V): Promise<V>;
}

@Module({
    namespaced: true,
    name: 'sync',
    preserveState: true
})
export class SyncModule extends VuexModule {

    events: ISyncEvent[] = [];
    versions = {};
    syncInProgress = false;

    @Mutation create(event: ISyncEvent) {
        this.events.push(event);
    }

    @Mutation flushEvents() {
        this.events = [];
    }

    @Mutation setVersion(value: { module: string, version: string }) {
        this.versions = { ...this.versions, [value.module]: value.version };
    }

    @Mutation setSyncInProgress(value: boolean) {
        this.syncInProgress = value;
    }

}

 const isSyncAdapter = <V>(object: any): object is ISyncAdapter<V> => {
    return (object as ISyncAdapter<V>).pull !== undefined
        && (object as ISyncAdapter<V>).push !== undefined;
};

export const syncEventDecorator = (module: string) => {
    return (event?: string) => {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            syncEventMetadata.push({
                type: `${module}/${String(propertyKey)}`,
                event: event || String(propertyKey),
                module,
            });
            return descriptor;
        };
    };
};

export const syncEventMediator = {
    pause: () => { syncEventMediationPaused = true; },
    resume: () => { syncEventMediationPaused = false; },

    plugin: (store: Store<any>) => {
        store.subscribe((mutation) => {
            const metadata = syncEventMetadata.find(
                (data) => data.type === mutation.type);

            if (!syncEventMediationPaused && metadata !== undefined) {
                getModule(SyncModule, store).create({
                    name: metadata.event,
                    module: metadata.module,
                    payload: cloneDeep(mutation.payload)
                });
            }
        });
    }
};

export const syncModules = async (store: Store<any>, modules) => {
    const syncModule = getModule(SyncModule, store);
    const groupedEvents = groupBy(syncModule.events, 'module');
    const jobs: Array<Promise<boolean>> = [];

    const syncWith = async (localVersion: string,
                            adapter: ISyncAdapter<string>,
                            changelog: ISyncEvent[]): Promise<string> => {
        let remoteVersion = await adapter.push({ localVersion, changelog });
        remoteVersion = await adapter.pull(remoteVersion || localVersion);
        return (remoteVersion || localVersion);
    };

    syncEventMediator.pause();
    syncModule.setSyncInProgress(true);

    try {
        for (const moduleName in modules) {
            const module = getModule(modules[moduleName], store);

            if (isSyncAdapter(module)) {
                const localVersion = syncModule.versions[moduleName];
                const moduleChangelog = groupedEvents[moduleName] || [];
                const adapter = module as ISyncAdapter<string>;

                jobs.push(syncWith(localVersion, adapter, moduleChangelog)
                    .then((remoteVersion) => {
                        syncModule.setVersion({module: moduleName, version: remoteVersion});
                        return remoteVersion !== localVersion;
                    }));
            }
        }

        const jobResults = await Promise.all(jobs);
        syncModule.flushEvents();
        return jobResults.some((actualDataSynced) => actualDataSynced);
    } finally {
        syncModule.setSyncInProgress(false);
        syncEventMediator.resume();
    }
};
