import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

const USERS_KEY = 'simple_weibo_users'
const CURRENT_USER_KEY = 'simple_weibo_current_user'

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

  it('should register a new user and auto login', () => {
    const store = useUserStore()
    const result = store.register('alice', '123456')

    expect(result.success).toBe(true)
    expect(store.users).toHaveLength(1)
    expect(store.currentUser.username).toBe('alice')
    expect(store.isLoggedIn).toBe(true)
    expect(localStorage.getItem(CURRENT_USER_KEY)).toContain('alice')
    expect(localStorage.getItem(USERS_KEY)).toContain('alice')
  })

  it('should not register duplicate user', () => {
    const store = useUserStore()
    store.register('alice', '123456')
    const result = store.register('alice', '654321')

    expect(result.success).toBe(false)
    expect(result.message).toBe('用户名已存在')
    expect(store.users).toHaveLength(1)
  })

  it('should login with correct credentials', () => {
    const store = useUserStore()
    store.register('alice', '123456')
    store.logout()

    const result = store.login('alice', '123456')
    expect(result.success).toBe(true)
    expect(store.currentUser.username).toBe('alice')
  })

  it('should reject login for non-existent user', () => {
    const store = useUserStore()
    const result = store.login('bob', '123456')

    expect(result.success).toBe(false)
    expect(result.message).toBe('用户不存在，请先注册')
  })

  it('should reject login with wrong password', () => {
    const store = useUserStore()
    store.register('alice', '123456')
    store.logout()

    const result = store.login('alice', 'wrong')
    expect(result.success).toBe(false)
    expect(result.message).toBe('密码错误')
  })

  it('should allow login without password if user has no password', () => {
    const store = useUserStore()
    store.register('alice', '')
    store.logout()

    const result = store.login('alice', '')
    expect(result.success).toBe(true)
  })

  it('should logout', () => {
    const store = useUserStore()
    store.register('alice', '123456')
    store.logout()

    expect(store.currentUser).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(localStorage.getItem(CURRENT_USER_KEY)).toBeNull()
  })

  it('should load users from localStorage', () => {
    localStorage.setItem(USERS_KEY, JSON.stringify([{ username: 'alice', password: '123456' }]))
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: 'alice', password: '123456' }))

    const store = useUserStore()
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
