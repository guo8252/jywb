import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '../utils/storage'
import { API_BASE } from '../config'

export const USERS_KEY = 'simple_weibo_users'
export const CURRENT_USER_KEY = 'simple_weibo_current_user'

const AVATAR_COLORS = ['#1a73e8', '#0d47a1', '#42a5f5', '#4caf50', '#ff9800', '#9c27b0', '#e91e63', '#00bcd4']

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
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
    async loadFromStorage() {
      this.currentUser = getItem(CURRENT_USER_KEY, null)
      try {
        const res = await fetch(`${API_BASE}/users`)
        const data = await res.json()
        if (data.success) {
          this.users = data.users
        }
      } catch (e) {
        console.error('加载用户列表失败', e)
      }
    },

    async register(username, password = '') {
      username = username.trim()
      if (!username) {
        return { success: false, message: '请输入用户名' }
      }

      try {
        const res = await fetch(`${API_BASE}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })
        const data = await res.json()

        if (!data.success) {
          return { success: false, message: data.message }
        }

        const user = data.user
        if (!this.users.find((u) => u.username === user.username)) {
          this.users.push(user)
        }
        this.currentUser = user
        setItem(CURRENT_USER_KEY, user)

        return { success: true, message: '注册成功' }
      } catch (e) {
        return { success: false, message: '注册失败' }
      }
    },

    async login(username, password = '') {
      username = username.trim()
      if (!username) {
        return { success: false, message: '请输入用户名' }
      }

      try {
        const res = await fetch(`${API_BASE}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })
        const data = await res.json()

        if (!data.success) {
          return { success: false, message: data.message }
        }

        const user = data.user
        if (!this.users.find((u) => u.username === user.username)) {
          this.users.push(user)
        }
        this.currentUser = user
        setItem(CURRENT_USER_KEY, user)

        return { success: true, message: '登录成功' }
      } catch (e) {
        return { success: false, message: '登录失败' }
      }
    },

    logout() {
      this.currentUser = null
      removeItem(CURRENT_USER_KEY)
    }
  }
})
