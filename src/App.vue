<template>
  <div id="app">
    <todo-list />
    <todo-form />
  </div>
</template>

<script lang="ts">
  import {Component, Provide, Vue} from 'vue-property-decorator';
  import TodoList from "@/components/TodoList.vue";
  import TodoForm from "@/components/TodoForm.vue";
  import {TodoModule} from "@/todo.module";
  import {getModule} from "vuex-module-decorators";

  @Component({
    components: {
      TodoList,
      TodoForm
    },
  })
  export default class App extends Vue {

    @Provide('todoModule')
    readonly todoModule: (() => TodoModule) = () => getModule(TodoModule, this.$store)

  }
</script>
