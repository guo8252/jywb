import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore, CURRENT_USER_KEY } from '../user'
import { setupTestApi } from './apiSetup'

setupTestApi()

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should have initial state', () => {
    const store = useUserStore()
    expect(store.currentUser).toBeNull()
    expect(store.users).toEqual([])
    expect(store.isLoggedIn).toBe(false)
  })

  it('should register a new user and auto login', async () => {
    const store = useUserStore()
    const result = await store.register('alice', '123456')

    expect(result.success).toBe(true)
    expect(store.users).toHaveLength(1)
    expect(store.currentUser.username).toBe('alice')
    expect(store.isLoggedIn).toBe(true)
  })

  it('should not register duplicate user', async () => {
    const store = useUserStore()
    await store.register('alice', '123456')
    const result = await store.register('alice', '654321')

    expect(result.success).toBe(false)
    expect(result.message).toBe('用户名已存在')
    expect(store.users).toHaveLength(1)
  })

  it('should login with correct credentials', async () => {
    const store = useUserStore()
    await store.register('alice', '123456')
    store.logout()

    const result = await store.login('alice', '123456')
    expect(result.success).toBe(true)
    expect(store.currentUser.username).toBe('alice')
  })

  it('should reject login for non-existent user', async () => {
    const store = useUserStore()
    const result = await store.login('bob', '123456')

    expect(result.success).toBe(false)
    expect(result.message).toBe('用户不存在，请先注册')
  })

  it('should reject login with wrong password', async () => {
    const store = useUserStore()
    await store.register('alice', '123456')
    store.logout()

    const result = await store.login('alice', 'wrong')
    expect(result.success).toBe(false)
    expect(result.message).toBe('密码错误')
  })

  it('should allow login without password if user has no password', async () => {
    const store = useUserStore()
    await store.register('alice', '')
    store.logout()

    const result = await store.login('alice', '')
    expect(result.success).toBe(true)
  })

  it('should logout', async () => {
    const store = useUserStore()
    await store.register('alice', '123456')
    store.logout()

    expect(store.currentUser).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(localStorage.getItem(CURRENT_USER_KEY)).toBeNull()
  })

  it('should load users from API and currentUser from localStorage', async () => {
    const store = useUserStore()
    await store.register('alice', '123456')
    store.logout()

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: 'alice' }))
    await store.loadFromStorage()

    expect(store.users).toHaveLength(1)
    expect(store.currentUser.username).toBe('alice')
    expect(store.isLoggedIn).toBe(true)
  })

  it('should generate avatar color and text', () => {
    const store = useUserStore()
    expect(store.getAvatarColor('alice')).toMatch(/^#/)
    expect(store.getAvatarText('alice')).toBe('AL')
  })
})
