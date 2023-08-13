import axios from 'axios';
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('globalStore', {
  state: () => ({ themeDark: false, login: false, userImage: ''}),
  getters: {
    test(state) {
      return state.login;
    },
  },
  actions: {
    async refreshToken() {
      /* eslint no-promise-executor-return: "off" */
      await new Promise((resolve) => setTimeout(resolve, 3600000));
      await this.isLogin();
    },
    async isLogin() {
      try {
        const response = await axios.get('http://localhost:3000/auth/', {
          withCredentials: true,
        });
        if (response.status === 200) {
          this.login = response.data.isLogin;
          this.userImage = response.data.imageUrl;
          console.log(response.data);
          await this.refreshToken();
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
});
