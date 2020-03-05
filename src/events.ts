import {getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import {Store} from "vuex";
import cloneDeep from 'lodash.clonedeep';

let eventMediationPaused = false;
const mutationEventMetadata: IMutationEventMetadata[] = [];

export interface IMutationEvent {
    readonly module: string;
    readonly name: string;
    readonly payload: any;
}

interface IMutationEventMetadata {
    readonly type: string;
    readonly event: string;
    readonly module: string;
}

@Module({
    namespaced: true,
    name: 'events',
    preserveState: true
})
export class EventModule extends VuexModule {

    events: IMutationEvent[] = [];

    @Mutation create(event: IMutationEvent) {
        this.events.push(event);
    }

    @Mutation flush() {
        this.events = [];
    }

}

export const mutationEventDecorator = (module: string) => {
    return (event?: string) => {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            mutationEventMetadata.push({
                type: `${module}/${String(propertyKey)}`,
                event: event || String(propertyKey),
                module,
            });
            return descriptor;
        };
    };
};

export const eventMediator = {
    pause: () => { eventMediationPaused = true; },
    resume: () => { eventMediationPaused = false; },

    plugin: (store: Store<any>) => {
        store.subscribe((mutation) => {
            const metadata = mutationEventMetadata.find(
                (data) => data.type === mutation.type);

            if (!eventMediationPaused && metadata !== undefined) {
                getModule(EventModule, store).create({
                    name: metadata.event,
                    module: metadata.module,
                    payload: cloneDeep(mutation.payload)
                });
            }
        });
    }
};
