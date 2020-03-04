import Vue from 'vue';
import Vuex from 'vuex';
import {TodoModule} from '@/todo.module';
import {eventMediator, EventModule} from "@/events";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    events: EventModule,
    todos: TodoModule,
  },
  plugins: [
    eventMediator.plugin
  ]
});
