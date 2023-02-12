import { defineStore } from 'pinia';
import axios from 'axios';

import Cookies from 'js-cookie'; 

export const useGlobalStore = defineStore('globalStore', {
  state: () => ({
    themeDark: false,
    login: false,
  }),
  getters: {
    test(state) {
      return state.login
    }
  },
  actions: {
    isLogin() {
      // axios.post('http://localhost:3000/auth/').then((res) => {
      //   console.log(res)
      // }).catch((err) => {
      //  console.log(err)
      // })
    }
  }
})

