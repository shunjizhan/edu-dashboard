import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // JSON.parse('null') => null
    user: JSON.parse(window.localStorage.getItem('user') || 'null'),
  },
  mutations: {
    setUser(state, user) {
      state.user = user;

      window.localStorage.setItem('user', JSON.stringify(user));
    },
  },
  actions: {
  },
  modules: {
  },
});
