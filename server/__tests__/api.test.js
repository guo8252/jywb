import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { serve } from '@hono/node-server'
import { app, resetData } from '../app.js'

let server
let baseUrl

beforeAll(() => {
  return new Promise((resolve) => {
    server = serve({ fetch: app.fetch, port: 0 }, (info) => {
      baseUrl = `http://localhost:${info.port}`
      resolve()
    })
  })
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  resetData()
})

async function post(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return { status: res.status, data: await res.json() }
}

async function get(path) {
  const res = await fetch(`${baseUrl}${path}`)
  return { status: res.status, data: await res.json() }
}

async function del(path) {
  const res = await fetch(`${baseUrl}${path}`, { method: 'DELETE' })
  return { status: res.status, data: await res.json() }
}

describe('Users API', () => {
  it('registers a new user', async () => {
    const { status, data } = await post('/api/users/register', { username: 'alice', password: '123456' })

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.username).toBe('alice')
  })

  it('rejects duplicate registration', async () => {
    await post('/api/users/register', { username: 'alice', password: '123456' })
    const { status, data } = await post('/api/users/register', { username: 'alice', password: '654321' })

    expect(status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe('用户名已存在')
  })

  it('rejects empty username', async () => {
    const { status, data } = await post('/api/users/register', { username: '   ' })

    expect(status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('请输入用户名')
  })

  it('logs in with correct credentials', async () => {
    await post('/api/users/register', { username: 'alice', password: '123456' })
    const { status, data } = await post('/api/users/login', { username: 'alice', password: '123456' })

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.username).toBe('alice')
  })

  it('rejects login for non-existent user', async () => {
    const { status, data } = await post('/api/users/login', { username: 'bob', password: '123456' })

    expect(status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe('用户不存在，请先注册')
  })

  it('rejects login with wrong password', async () => {
    await post('/api/users/register', { username: 'alice', password: '123456' })
    const { status, data } = await post('/api/users/login', { username: 'alice', password: 'wrong' })

    expect(status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('密码错误')
  })

  it('allows login without password when user has no password', async () => {
    await post('/api/users/register', { username: 'alice', password: '' })
    const { status, data } = await post('/api/users/login', { username: 'alice', password: '' })

    expect(status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns user list', async () => {
    await post('/api/users/register', { username: 'alice' })
    await post('/api/users/register', { username: 'bob' })

    const { status, data } = await get('/api/users')

    expect(status).toBe(200)
    expect(data.users).toHaveLength(2)
    expect(data.users.map((u) => u.username).sort()).toEqual(['alice', 'bob'])
  })

  it('logs out successfully', async () => {
    const { status, data } = await post('/api/users/logout', {})

    expect(status).toBe(200)
    expect(data.success).toBe(true)
  })
})

describe('Posts API', () => {
  async function registerAndLogin(username) {
    await post('/api/users/register', { username })
  }

  it('creates a text post', async () => {
    await registerAndLogin('alice')
    const { status, data } = await post('/api/posts', { username: 'alice', content: 'Hello world', media: [] })

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.post.content).toBe('Hello world')
    expect(data.post.author).toBe('alice')
  })

  it('creates a post with media', async () => {
    await registerAndLogin('alice')
    const media = [{ type: 'image', data: 'data:image/png;base64,abc', name: 'a.png' }]
    const { status, data } = await post('/api/posts', { username: 'alice', content: 'With media', media })

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.post.media).toEqual(media)
  })

  it('rejects empty post', async () => {
    await registerAndLogin('alice')
    const { status, data } = await post('/api/posts', { username: 'alice', content: '', media: [] })

    expect(status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('请输入微博内容或上传媒体')
  })

  it('rejects too many media files', async () => {
    await registerAndLogin('alice')
    const media = Array.from({ length: 5 }, (_, i) => ({
      type: 'image',
      data: 'data:image/png;base64,abc',
      name: `${i}.png`
    }))
    const { status, data } = await post('/api/posts', { username: 'alice', content: 'Too many', media })

    expect(status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('每条微博最多上传4个媒体')
  })

  it('rejects oversized media', async () => {
    await registerAndLogin('alice')
    const hugeBase64 = 'data:image/png;base64,' + 'A'.repeat(Math.ceil((2 * 1024 * 1024 * 4) / 3) + 10)
    const { status, data } = await post('/api/posts', {
      username: 'alice',
      content: 'Big file',
      media: [{ type: 'image', data: hugeBase64, name: 'big.png' }]
    })

    expect(status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('单个媒体文件超过2MB限制')
  })

  it('lists posts for a user', async () => {
    await registerAndLogin('alice')
    await post('/api/posts', { username: 'alice', content: 'Post one', media: [] })
    await post('/api/posts', { username: 'alice', content: 'Post two', media: [] })

    const { status, data } = await get('/api/posts?username=alice')

    expect(status).toBe(200)
    expect(data.posts).toHaveLength(2)
    expect(data.posts.map((p) => p.content)).toEqual(['Post two', 'Post one'])
  })

  it('deletes a post', async () => {
    await registerAndLogin('alice')
    const created = await post('/api/posts', { username: 'alice', content: 'To delete', media: [] })
    const id = created.data.post.id

    const { status, data } = await del(`/api/posts/${id}?username=alice`)

    expect(status).toBe(200)
    expect(data.success).toBe(true)

    const list = await get('/api/posts?username=alice')
    expect(list.data.posts).toHaveLength(0)
  })

  it('returns 404 when deleting non-existent post', async () => {
    await registerAndLogin('alice')
    const { status, data } = await del('/api/posts/999?username=alice')

    expect(status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe('微博不存在')
  })
})

describe('User isolation', () => {
  it('keeps posts isolated between users', async () => {
    await post('/api/users/register', { username: 'alice' })
    await post('/api/users/register', { username: 'bob' })

    await post('/api/posts', { username: 'alice', content: 'Alice secret', media: [] })

    const alicePosts = await get('/api/posts?username=alice')
    const bobPosts = await get('/api/posts?username=bob')

    expect(alicePosts.data.posts).toHaveLength(1)
    expect(bobPosts.data.posts).toHaveLength(0)
  })

  it('does not delete other users posts', async () => {
    await post('/api/users/register', { username: 'alice' })
    await post('/api/users/register', { username: 'bob' })

    const created = await post('/api/posts', { username: 'alice', content: 'Alice post', media: [] })
    const id = created.data.post.id

    const { status, data } = await del(`/api/posts/${id}?username=bob`)

    expect(status).toBe(404)
    expect(data.success).toBe(false)

    const alicePosts = await get('/api/posts?username=alice')
    expect(alicePosts.data.posts).toHaveLength(1)
  })
})

describe('Sample posts', () => {
  it('initializes 10 sample posts', async () => {
    await post('/api/users/register', { username: 'alice' })
    const { status, data } = await post('/api/posts/init-samples', { username: 'alice' })

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.posts).toHaveLength(10)
    expect(data.posts[0].author).toBe('alice')

    const list = await get('/api/posts?username=alice')
    expect(list.data.posts).toHaveLength(10)
  })

  it('does not overwrite existing posts', async () => {
    await post('/api/users/register', { username: 'alice' })
    await post('/api/posts', { username: 'alice', content: 'Existing', media: [] })

    const { status, data } = await post('/api/posts/init-samples', { username: 'alice' })

    expect(status).toBe(409)
    expect(data.success).toBe(false)

    const list = await get('/api/posts?username=alice')
    expect(list.data.posts).toHaveLength(1)
  })
})
