import {IMutationEvent} from "@/events";

export interface IPushRequest<V> {
    localVersion: V;
    changelog: IMutationEvent[];
}

export interface ISyncAdapter<V> {
    push(request: IPushRequest<V>): Promise<V>;
    pull(localVersion: V): Promise<V>;
}

export function isSyncAdapter<V>(object: any): object is ISyncAdapter<V> {
    return (object as ISyncAdapter<V>).pull !== undefined
        && (object as ISyncAdapter<V>).push !== undefined;
}
