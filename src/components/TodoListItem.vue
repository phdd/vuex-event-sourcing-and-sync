<template>
    <li>
        <span>{{ item.description }}</span>
        <button @click="$emit('remove', item)">delete</button>
    </li>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {ITodo} from "@/todo.module";

    @Component
    export default class TodoListItem extends Vue {

        @Prop({ required: true, type: Object })
        readonly item!: ITodo;

    }
</script>
