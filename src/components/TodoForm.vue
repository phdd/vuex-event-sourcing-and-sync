<template>
    <div>
        <label for="description">Description</label>
        <input type="text" id="description" v-model.lazy.trim="description" @keyup.enter="add" />
    </div>
</template>

<script lang="ts">
    import {Component, Inject, Vue} from 'vue-property-decorator';
    import {TodoModule} from "@/todo.module";

    @Component
    export default class TodoForm extends Vue {

        @Inject('todoModule')
        readonly todoModule!: (() => TodoModule);

        description: string = '';

        add() {
            this.todoModule().create({
                description: this.description,
                completed: false
            });

            this.description = '';
        }
    }
</script>
