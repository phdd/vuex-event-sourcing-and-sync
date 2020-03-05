<template>
  <div id="app">
    <todo-list />
    <todo-form />
    <sync-button />
  </div>
</template>

<script lang="ts">
  import {Component, Provide, Vue} from 'vue-property-decorator';
  import TodoList from "@/components/TodoList.vue";
  import TodoForm from "@/components/TodoForm.vue";
  import SyncButton from "@/components/SyncButton.vue";
  import {TodoModule} from "@/todo.module";
  import {getModule} from "vuex-module-decorators";
  import {AppModule} from "@/app.module";

  @Component({
    components: {
      TodoList,
      TodoForm,
      SyncButton
    },
  })
  export default class App extends Vue {

    @Provide('todoModule')
    readonly todoModule: (() => TodoModule) = () => getModule(TodoModule, this.$store)

    @Provide('appModule')
    readonly appModule: (() => AppModule) = () => getModule(AppModule, this.$store)

  }
</script>
