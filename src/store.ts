import Vue from 'vue';
import Vuex from 'vuex';
import {TodoModule} from '@/todo.module';
import {syncEventMediator, SyncModule} from "@/sync";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export const modules = {
  sync: SyncModule,
  todos: TodoModule,
};

export default new Vuex.Store({
  modules,
  plugins: [
    syncEventMediator.plugin,
    createPersistedState()
  ]
});
