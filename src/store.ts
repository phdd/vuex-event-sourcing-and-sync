import Vue from 'vue';
import Vuex from 'vuex';
import {TodoModule} from '@/todo.module';
import {eventMediator, EventModule} from "@/events";
import createPersistedState from "vuex-persistedstate";
import {AppModule} from "@/app.module";

Vue.use(Vuex);

export const modules = {
  app: AppModule,
  events: EventModule,
  todos: TodoModule,
};

export default new Vuex.Store({
  modules,
  plugins: [
    eventMediator.plugin,
    createPersistedState()
  ]
});
