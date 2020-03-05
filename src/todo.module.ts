import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators';
import {Guid} from 'guid-typescript';
import {IMutationEvent, mutationEventDecorator} from "@/events";
import {IPushRequest, ISyncAdapter} from "@/sync";
import * as todoist from '@/todoist';
import includes from 'lodash.includes';

const moduleName = 'todos';
const TodoEvent = mutationEventDecorator(moduleName);

export interface ITodo {
    id?: string | number;
    description: string;
    completed: boolean;
}

@Module({
    namespaced: true,
    name: moduleName
})
export class TodoModule extends VuexModule implements ISyncAdapter<string> {

    items: ITodo[] = [];

    @TodoEvent('item_add')
    @Mutation create(todo: ITodo) {
        todo.id = todo.id || Guid.create().toString();
        this.items.push(todo);
    }

    @TodoEvent('item_update')
    @Mutation update(todo: ITodo) {
        const existingTodo = this.items[this.items.findIndex(
            (item) => item.id === todo.id)];

        existingTodo.completed = todo.completed;
        existingTodo.description = todo.description;
    }

    @TodoEvent('item_delete')
    @Mutation delete(todo: ITodo) {
        this.items.splice(this.items.findIndex(
            (item) => item.id === todo.id), 1);
    }

    @Mutation assignRemoteIds(mapping: object) {
        const affected: string[] = Object.keys(mapping);

        this.items
            .filter((item) => includes(affected, item.id))
            .forEach((item) => item.id = mapping[item.id!]);
    }

    @Action save(todo: ITodo) {
        if (todo.id === undefined) {
            this.context.commit('create', todo);
        } else {
            this.context.commit('update', todo);
        }
    }

    @Action async push(request: IPushRequest<string>): Promise<string> {
        const hasRemoteId = (item: ITodo) => typeof item.id === 'number';

        const isItemDeleted = (item: ITodo) =>
            request.changelog.some((candidate) =>
                item.id === candidate.payload.id && candidate.name === 'item_delete');

        const notDeletedBeforeFirstPush = (toBePushed: IMutationEvent) =>
            hasRemoteId(toBePushed.payload) || !isItemDeleted(toBePushed.payload);

        const commands = request.changelog
            .filter(notDeletedBeforeFirstPush)
            .map((event) => ({
                type: event.name,
                uuid: Guid.create().toString(),
                temp_id: (event.name === 'item_add') ? event.payload.id : undefined,
                args: {
                    id: (event.name !== 'item_add') ? parseInt(event.payload.id, 10) : undefined,
                    content: event.payload.description,
                    checked: (event.payload.completed ? 1 : 0)
                }
            }));

        if (commands.length > 0) {
            const {temp_id_mapping, sync_token} = await todoist.push(commands);

            if (Object.keys(temp_id_mapping).length > 0) {
                this.context.commit('assignRemoteIds', temp_id_mapping);
            }

            return sync_token;
        } else {
            return request.localVersion;
        }
    }

    @Action async pull(localVersion: string): Promise<string> {
        const remoteItemMapper = (remoteItem: any): ITodo => ({
            id: remoteItem.id,
            description: remoteItem.content,
            completed: remoteItem.checked === 1
        });

        const { items, sync_token } = await todoist.pull(localVersion);

        if (localVersion !== sync_token) {
            const localIds = this.items.map((item) => item.id);

            items.filter((item) => item.is_deleted === 1)
                .filter((item) => includes(localIds, item.id))
                .forEach((item) => this.context.commit('delete', item));

            items.filter((item) => item.is_deleted === 0)
                .filter((item) => includes(localIds, item.id))
                .map(remoteItemMapper)
                .forEach((item) => this.context.commit('update', item));

            items.filter((item) => item.is_deleted === 0)
                .filter((item) => !includes(localIds, item.id))
                .map(remoteItemMapper)
                .forEach((item) => this.context.commit('create', item));
        }

        return sync_token;
    }

}
