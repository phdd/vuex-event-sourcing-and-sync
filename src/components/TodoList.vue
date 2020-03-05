<template>
    <ul>
        <todo-list-item
                v-for="item in items" :key="item.id" :item="item"
                @remove="remove"
                @completed="complete"
                @uncompleted="uncomplete"
        />
    </ul>
</template>

<script lang="ts">
    import {Component, Inject, Vue} from 'vue-property-decorator';
    import TodoListItem from '@/components/TodoListItem.vue';
    import {ITodo, TodoModule} from "@/todo.module";

    @Component({
        components: {
            TodoListItem
        }
    })
    export default class TodoList extends Vue {

        @Inject('todoModule')
        readonly todoModule!: (() => TodoModule);

        get items() {
            return this.todoModule().items;
        }

        remove(item: ITodo) {
            this.todoModule().delete(item);
        }

        complete(item: ITodo) {
            this.todoModule().complete(item);
        }

        uncomplete(item: ITodo) {
            this.todoModule().uncomplete(item);
        }

    }
</script>
