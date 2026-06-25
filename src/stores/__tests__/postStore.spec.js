import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import { usePostStore } from '../post'
import { setupTestApi } from './apiSetup'

setupTestApi()

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

  it('should load posts for current user', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    await postStore.addPost('hello', [])
    postStore.posts = []
    await postStore.loadPosts()

    expect(postStore.posts).toHaveLength(1)
    expect(postStore.posts[0].content).toBe('hello')
    expect(postStore.postCount).toBe(1)
  })

  it('should add a post with content', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    const result = await postStore.addPost('My first post', [])

    expect(result.success).toBe(true)
    expect(postStore.posts).toHaveLength(1)
    expect(postStore.posts[0].content).toBe('My first post')
    expect(postStore.posts[0].author).toBe('alice')
  })

  it('should add a post with media', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    const media = [{ type: 'image', data: 'data:image/png;base64,abc', name: 'a.png' }]
    await postStore.addPost('With image', media)

    expect(postStore.posts[0].media).toEqual(media)
  })

  it('should reject empty post', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    const result = await postStore.addPost('', [])

    expect(result.success).toBe(false)
    expect(result.message).toBe('请输入微博内容或上传媒体')
  })

  it('should delete own post', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    await postStore.addPost('hello', [])
    const id = postStore.posts[0].id

    const result = await postStore.deletePost(id)
    expect(result.success).toBe(true)
    expect(postStore.posts).toHaveLength(0)
  })

  it('should not delete post when not logged in', async () => {
    const postStore = usePostStore()
    const result = await postStore.deletePost(1)

    expect(result.success).toBe(false)
    expect(result.message).toBe('请先登录')
  })

  it('should keep posts isolated between users', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    await postStore.addPost('alice post', [])

    await userStore.register('bob', '123456')
    await postStore.loadPosts()

    expect(postStore.posts).toEqual([])
  })

  it('should initialize sample posts for new user', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    await postStore.initSamplePosts()

    expect(postStore.posts.length).toBe(10)
    expect(postStore.postCount).toBe(10)
    expect(postStore.posts[0].author).toBe('alice')
  })

  it('should not overwrite existing posts when initializing samples', async () => {
    const userStore = useUserStore()
    await userStore.register('alice', '123456')

    const postStore = usePostStore()
    await postStore.addPost('existing', [])
    await postStore.initSamplePosts()

    expect(postStore.posts.length).toBe(1)
    expect(postStore.posts[0].content).toBe('existing')
  })
})
