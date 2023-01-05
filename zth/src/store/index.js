import { createStore } from "vuex";


export const state = () => {
  return {
    themeDark: false,
  };
};

export const mutations = {
  TOGGLE(state) {
    state.themeDark = !state.themeDark;
  },
};

const store = createStore({
  state,
  mutations,
});
export default store;
