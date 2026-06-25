import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { API_BASE } from '../config'

export const POSTS_PREFIX = 'simple_weibo_posts'

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: []
  }),

  getters: {
    sortedPosts: (state) => {
      return [...state.posts].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    },

    postCount: (state) => state.posts.length
  },

  actions: {
    async loadPosts() {
      const userStore = useUserStore()
      if (!userStore.currentUser) {
        this.posts = []
        return
      }

      try {
        const username = userStore.currentUser.username
        const res = await fetch(`${API_BASE}/posts?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        this.posts = data.success ? data.posts : []
      } catch (e) {
        console.error('加载微博失败', e)
        this.posts = []
      }
    },

    async addPost(content, media) {
      const userStore = useUserStore()
      if (!userStore.currentUser) {
        return { success: false, message: '请先登录' }
      }

      const trimmedContent = content.trim()
      if (!trimmedContent && (!media || media.length === 0)) {
        return { success: false, message: '请输入微博内容或上传媒体' }
      }

      try {
        const res = await fetch(`${API_BASE}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userStore.currentUser.username,
            content: trimmedContent,
            media: media || []
          })
        })
        const data = await res.json()

        if (data.success && data.post) {
          this.posts.unshift(data.post)
        }

        return { success: data.success, message: data.message }
      } catch (e) {
        return { success: false, message: '发布失败' }
      }
    },

    async deletePost(id) {
      const userStore = useUserStore()
      if (!userStore.currentUser) {
        return { success: false, message: '请先登录' }
      }

      try {
        const username = userStore.currentUser.username
        const res = await fetch(`${API_BASE}/posts/${id}?username=${encodeURIComponent(username)}`, {
          method: 'DELETE'
        })
        const data = await res.json()

        if (data.success) {
          this.posts = this.posts.filter((post) => post.id !== id)
        }

        return { success: data.success, message: data.message }
      } catch (e) {
        return { success: false, message: '删除失败' }
      }
    },

    async initSamplePosts() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (this.posts.length > 0) return

      try {
        const username = userStore.currentUser.username
        const res = await fetch(`${API_BASE}/posts/init-samples`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })
        const data = await res.json()

        if (data.success) {
          this.posts = data.posts
        }
      } catch (e) {
        console.error('初始化样例失败', e)
      }
    }
  }
})
