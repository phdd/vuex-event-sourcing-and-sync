import {Action, Module, Mutation, VuexModule} from 'vuex-module-decorators';
import {Guid} from 'guid-typescript';

export interface ITodo {
    id?: string;
    description: string;
    completed: boolean;
}

@Module({
    namespaced: true,
    name: 'todos'
})
export class TodoModule extends VuexModule {

    items: ITodo[] = [];

    @Mutation create(todo: ITodo) {
        todo.id = Guid.create().toString();
        this.items.push(todo);
    }

    @Mutation update(todo: ITodo) {
        const existingTodo = this.items[this.items.findIndex(
            (item) => item.id === todo.id)];

        existingTodo.completed = todo.completed;
        existingTodo.description = todo.description;
    }

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
