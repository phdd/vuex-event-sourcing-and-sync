import {getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import {Store} from "vuex";

let eventListeningPaused = false;
const mutationEventMetadata: IMutationEventMetadata[] = [];

interface IMutationEvent {
    readonly module: string;
    readonly name: string;
    readonly payload: any;
}

interface IMutationEventMetadata {
    readonly type: string;
    readonly name: string;
    readonly module: string;
    readonly stateMapper: (value: any) => any;
}

@Module({
    namespaced: true,
    name: 'events'
})
export class EventModule extends VuexModule {

    items: IMutationEvent[] = [];

    @Mutation create(event: IMutationEvent) {
        this.items.push(event);
    }

}

export const mutationEventDecorator = (module: string, stateMapper?: (value: any) => any) => {
    return (name?: string) => {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            mutationEventMetadata.push({
                type: `${module}/${String(propertyKey)}`,
                name: name || String(propertyKey),
                stateMapper: stateMapper || ((v) => v),
                module,
            });
            return descriptor;
        };
    };
};

export const eventListener = {
    pause: () => { eventListeningPaused = true; },
    resume: () => { eventListeningPaused = false; },

    plugin: (store: Store<any>) => {
        store.subscribe((mutation) => {
            const metadata = mutationEventMetadata.find(
                (data) => data.type === mutation.type);

            if (!eventListeningPaused && metadata !== undefined) {
                getModule(EventModule, store).create({
                    name: metadata.name,
                    module: metadata.module,
                    payload: metadata.stateMapper(mutation.payload)
                });
            }
        });
    }
};
