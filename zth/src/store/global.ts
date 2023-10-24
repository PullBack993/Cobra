import axios from 'axios';
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('globalStore', {
  state: () => ({ themeDark: false, login: false, userImage: '', newsPaginationCounter: 1, scrollPosition: 0}),
  getters: {
    test(state) {
      return state.login;
    },
  },
  actions: {
    setUser(user:{isLoggedIn: boolean, imageUrl: string}){
      this.login = user.isLoggedIn;
      this.userImage = user.imageUrl;
    },
    clearUser() {
      this.login = false;
      this.userImage = '';
    },
    async isLogin() {
      try {
        const response = await axios.get('http://localhost:3000/auth/', {
          withCredentials: true,
        });
        if (response.status === 200) {
          this.setUser(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
});
