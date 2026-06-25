import { defineStore, storeToRefs } from 'pinia'
import { useUserStore } from './user'
import { getItem, setItem } from '../utils/storage'

export const POSTS_PREFIX = 'simple_weibo_posts'

function generateSvgImage(text, color1, color2, width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">${text}</text>
  </svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

function buildSamplePosts(username) {
  const sampleImages = [
    generateSvgImage('晨曦', '#FF8C00', '#1a73e8', 400, 300),
    generateSvgImage('山林', '#4CAF50', '#2E7D32', 400, 300),
    generateSvgImage('星空', '#1a237e', '#7c4dff', 400, 300),
    generateSvgImage('海浪', '#00BCD4', '#01579b', 400, 300),
    generateSvgImage('花田', '#f48fb1', '#c2185b', 400, 300)
  ]

  const sampleVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  const samples = [
    { content: '静言悟本，记录生活点滴。今天是个好日子，和大家分享一张美丽的风景图。', imageIndex: 0 },
    { content: '清晨的山林，空气格外清新，让人心旷神怡。', imageIndex: 1 },
    { content: '昨晚拍到的星空，太美了！分享给大家。', imageIndex: 2 },
    { content: '海浪拍打礁石，听，是大海的声音。', imageIndex: 3 },
    { content: '春天的花田，满眼都是希望。', imageIndex: 4 },
    { content: '一段有趣的视频，推荐给大家观看。', isVideo: true },
    { content: '生活不止眼前的苟且，还有诗和远方。', imageIndex: 0 },
    { content: '静下心，感悟本真，这就是生活的意义。', imageIndex: 2 },
    { content: '记录一次难忘的旅行，风景如画。', imageIndex: 1 },
    { content: '今天的晚霞特别美，忍不住拍了下来。', imageIndex: 3 }
  ]

  const now = Date.now()
  return samples.map((sample, index) => {
    const media = []
    if (sample.isVideo) {
      media.push({ type: 'video', data: sampleVideo, name: 'sample-video.mp4' })
    } else {
      media.push({ type: 'image', data: sampleImages[sample.imageIndex], name: `sample-${index}.svg` })
    }

    return {
      id: now - index * 1000,
      content: sample.content,
      author: username,
      media: media,
      createTime: new Date(now - index * 3600000).toISOString()
    }
  })
}

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
    _getStorageKey() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return null
      return `${POSTS_PREFIX}_${userStore.currentUser.username}`
    },

    loadPosts() {
      const key = this._getStorageKey()
      if (!key) {
        this.posts = []
        return
      }
      this.posts = getItem(key, [])
    },

    addPost(content, media) {
      const userStore = useUserStore()
      if (!userStore.currentUser) {
        return { success: false, message: '请先登录' }
      }

      const trimmedContent = content.trim()
      if (!trimmedContent && (!media || media.length === 0)) {
        return { success: false, message: '请输入微博内容或上传媒体' }
      }

      const key = this._getStorageKey()
      const newPost = {
        id: Date.now(),
        content: trimmedContent,
        author: userStore.currentUser.username,
        media: media || [],
        createTime: new Date().toISOString()
      }

      this.posts.unshift(newPost)
      setItem(key, this.posts)
      return { success: true, message: '发布成功' }
    },

    deletePost(id) {
      const userStore = useUserStore()
      if (!userStore.currentUser) {
        return { success: false, message: '请先登录' }
      }

      const key = this._getStorageKey()
      this.posts = this.posts.filter(post => post.id !== id)
      setItem(key, this.posts)
      return { success: true, message: '删除成功' }
    },

    initSamplePosts() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (this.posts.length > 0) return

      const key = this._getStorageKey()
      this.posts = buildSamplePosts(userStore.currentUser.username)
      setItem(key, this.posts)
    }
  }
})
