import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import { usePostStore } from '../post'

const POSTS_PREFIX = 'simple_weibo_posts'

describe('usePostStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should have empty posts when no user logged in', () => {
    const store = usePostStore()
    expect(store.posts).toEqual([])
    expect(store.sortedPosts).toEqual([])
    expect(store.postCount).toBe(0)
  })

  it('should load posts for current user', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    localStorage.setItem(`${POSTS_PREFIX}_alice`, JSON.stringify([
      { id: 1, content: 'hello', author: 'alice', media: [], createTime: '2026-01-01T00:00:00.000Z' }
    ]))

    const postStore = usePostStore()
    postStore.loadPosts()

    expect(postStore.posts).toHaveLength(1)
    expect(postStore.posts[0].content).toBe('hello')
    expect(postStore.postCount).toBe(1)
  })

  it('should add a post with content', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    const result = postStore.addPost('My first post', [])

    expect(result.success).toBe(true)
    expect(postStore.posts).toHaveLength(1)
    expect(postStore.posts[0].content).toBe('My first post')
    expect(postStore.posts[0].author).toBe('alice')
    expect(localStorage.getItem(`${POSTS_PREFIX}_alice`)).toContain('My first post')
  })

  it('should add a post with media', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    const media = [{ type: 'image', data: 'data:image/png;base64,abc', name: 'a.png' }]
    postStore.addPost('With image', media)

    expect(postStore.posts[0].media).toEqual(media)
  })

  it('should reject empty post', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    const result = postStore.addPost('', [])

    expect(result.success).toBe(false)
    expect(result.message).toBe('请输入微博内容或上传媒体')
  })

  it('should delete own post', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    postStore.addPost('hello', [])
    const id = postStore.posts[0].id

    const result = postStore.deletePost(id)
    expect(result.success).toBe(true)
    expect(postStore.posts).toHaveLength(0)
    expect(localStorage.getItem(`${POSTS_PREFIX}_alice`)).toBe('[]')
  })

  it('should not delete post when not logged in', () => {
    const postStore = usePostStore()
    const result = postStore.deletePost(1)

    expect(result.success).toBe(false)
    expect(result.message).toBe('请先登录')
  })

  it('should keep posts isolated between users', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    postStore.addPost('alice post', [])

    userStore.register('bob', '123456')
    postStore.loadPosts()

    expect(postStore.posts).toEqual([])
  })

  it('should initialize sample posts for new user', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    postStore.initSamplePosts()

    expect(postStore.posts.length).toBe(10)
    expect(postStore.postCount).toBe(10)
    expect(postStore.posts[0].author).toBe('alice')
  })

  it('should not overwrite existing posts when initializing samples', () => {
    const userStore = useUserStore()
    userStore.register('alice', '123456')

    const postStore = usePostStore()
    postStore.addPost('existing', [])
    postStore.initSamplePosts()

    expect(postStore.posts.length).toBe(1)
    expect(postStore.posts[0].content).toBe('existing')
  })
})
