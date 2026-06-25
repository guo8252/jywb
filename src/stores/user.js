import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '../utils/storage'

export const USERS_KEY = 'simple_weibo_users'
export const CURRENT_USER_KEY = 'simple_weibo_current_user'

const AVATAR_COLORS = ['#1a73e8', '#0d47a1', '#42a5f5', '#4caf50', '#ff9800', '#9c27b0', '#e91e63', '#00bcd4']

export const useUserStore = defineStore('user', {
  state: () => ({
    users: getItem(USERS_KEY, []),
    currentUser: getItem(CURRENT_USER_KEY, null)
  }),

  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    currentUsername: (state) => state.currentUser?.username || '',

    getAvatarColor: () => (username) => {
      let hash = 0
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash)
      }
      return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
    },

    getAvatarText: () => (username) => {
      return username.slice(0, 2).toUpperCase()
    }
  },

  actions: {
    loadFromStorage() {
      this.users = getItem(USERS_KEY, [])
      this.currentUser = getItem(CURRENT_USER_KEY, null)
    },

    register(username, password = '') {
      username = username.trim()
      if (!username) {
        return { success: false, message: '请输入用户名' }
      }

      if (this.users.find(u => u.username === username)) {
        return { success: false, message: '用户名已存在' }
      }

      const newUser = { username, password }
      this.users.push(newUser)
      setItem(USERS_KEY, this.users)
      this.currentUser = newUser
      setItem(CURRENT_USER_KEY, newUser)

      return { success: true, message: '注册成功' }
    },

    login(username, password = '') {
      username = username.trim()
      if (!username) {
        return { success: false, message: '请输入用户名' }
      }

      const user = this.users.find(u => u.username === username)
      if (!user) {
        return { success: false, message: '用户不存在，请先注册' }
      }

      if (user.password && user.password !== password) {
        return { success: false, message: '密码错误' }
      }

      this.currentUser = user
      setItem(CURRENT_USER_KEY, user)
      return { success: true, message: '登录成功' }
    },

    logout() {
      this.currentUser = null
      removeItem(CURRENT_USER_KEY)
    }
  }
})
