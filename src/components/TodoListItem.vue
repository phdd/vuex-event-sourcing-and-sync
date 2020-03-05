<template>
    <li>
        <input type="checkbox" v-model="item.completed" />
        <button @click="$emit('remove', item)">delete</button>
        <span>{{ item.id }}: {{ item.description }}</span>
    </li>
</template>

<script lang="ts">
    import {Component, Emit, Prop, Vue, Watch} from 'vue-property-decorator';
    import {ITodo} from "@/todo.module";

    @Component
    export default class TodoListItem extends Vue {

        @Prop({ required: true, type: Object })
        readonly item!: ITodo;

        @Watch('item.completed')
        @Emit() update() {
            return this.item;
        }

    }
</script>
