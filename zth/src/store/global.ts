import axios from 'axios';
import { defineStore } from 'pinia';

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
      //TODO try catch
       axios.get('http://localhost:3000/auth/', { withCredentials: true }).then((res) => {
         console.log(res)
         this.login = res.data.isLogin
    })
    }
  }
  
})

