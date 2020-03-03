import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators';
import {Guid} from 'guid-typescript';
import {mutationEventDecorator} from "@/events";

const moduleName = 'todos';
const TodoEvent = mutationEventDecorator(moduleName, (v) => v.id);

export interface ITodo {
    id?: string;
    description: string;
    completed: boolean;
}

@Module({
    namespaced: true,
    name: moduleName
})
export class TodoModule extends VuexModule {

    items: ITodo[] = [];

    @TodoEvent('item_add')
    @Mutation create(todo: ITodo) {
        todo.id = Guid.create().toString();
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

    @Action save(todo: ITodo) {
        if (todo.id === undefined) {
            this.context.commit('create', todo);
        } else {
            this.context.commit('update', todo);
        }
    }

}
