import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {}
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    logout() {
      this.token = ''
      this.userInfo = {}
    },
    checkLogin() {
      // Implement login check logic
      if (!this.token) {
        // Redirect to login page or handle unauthenticated access
        console.log('User not logged in')
        return false
      }
      return true
    }
  }
})