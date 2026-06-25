import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
  '/*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type']
  })
)

const users = new Map()
const posts = new Map()
let nextPostId = Date.now()

const MAX_MEDIA_BYTES = 2 * 1024 * 1024
const MAX_MEDIA_COUNT = 4
const MAX_BASE64_LENGTH = Math.ceil((MAX_MEDIA_BYTES * 4) / 3)

export function resetData() {
  users.clear()
  posts.clear()
  nextPostId = Date.now()
}

function sanitizeUser(user) {
  return { username: user.username }
}

function getUserPosts(username) {
  return posts.get(username) || []
}

function validateMedia(media) {
  if (!Array.isArray(media)) {
    return { valid: false, message: '媒体格式错误' }
  }
  if (media.length > MAX_MEDIA_COUNT) {
    return { valid: false, message: '每条微博最多上传4个媒体' }
  }
  for (const item of media) {
    if (!item || typeof item.data !== 'string') {
      return { valid: false, message: '媒体数据错误' }
    }
    const base64Part = item.data.includes(',') ? item.data.split(',')[1] : item.data
    if (base64Part.length > MAX_BASE64_LENGTH) {
      return { valid: false, message: '单个媒体文件超过2MB限制' }
    }
  }
  return { valid: true }
}

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
  return 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64')
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
      media,
      createTime: new Date(now - index * 3600000).toISOString()
    }
  })
}

app.post('/api/users/register', async (c) => {
  const body = await c.req.json()
  const username = body.username?.trim()
  const password = body.password ?? ''

  if (!username) {
    return c.json({ success: false, message: '请输入用户名' }, 400)
  }

  if (users.has(username)) {
    return c.json({ success: false, message: '用户名已存在' }, 409)
  }

  const user = { username, password }
  users.set(username, user)
  return c.json({ success: true, message: '注册成功', user: sanitizeUser(user) })
})

app.post('/api/users/login', async (c) => {
  const body = await c.req.json()
  const username = body.username?.trim()
  const password = body.password ?? ''

  if (!username) {
    return c.json({ success: false, message: '请输入用户名' }, 400)
  }

  const user = users.get(username)
  if (!user) {
    return c.json({ success: false, message: '用户不存在，请先注册' }, 404)
  }

  if (user.password !== password) {
    return c.json({ success: false, message: '密码错误' }, 401)
  }

  return c.json({ success: true, message: '登录成功', user: sanitizeUser(user) })
})

app.get('/api/users', (c) => {
  return c.json({ success: true, users: [...users.values()].map(sanitizeUser) })
})

app.post('/api/users/logout', (c) => {
  return c.json({ success: true, message: '退出成功' })
})

app.get('/api/posts', (c) => {
  const username = c.req.query('username')?.trim()
  if (!username) {
    return c.json({ success: false, message: '缺少用户名' }, 400)
  }
  return c.json({ success: true, posts: getUserPosts(username) })
})

app.post('/api/posts', async (c) => {
  const body = await c.req.json()
  const username = body.username?.trim()
  const content = (body.content ?? '').trim()
  const media = body.media || []

  if (!username) {
    return c.json({ success: false, message: '缺少用户名' }, 400)
  }

  if (!users.has(username)) {
    return c.json({ success: false, message: '用户不存在' }, 404)
  }

  if (!content && media.length === 0) {
    return c.json({ success: false, message: '请输入微博内容或上传媒体' }, 400)
  }

  const validation = validateMedia(media)
  if (!validation.valid) {
    return c.json({ success: false, message: validation.message }, 400)
  }

  const newPost = {
    id: nextPostId++,
    content,
    author: username,
    media,
    createTime: new Date().toISOString()
  }

  const userPosts = getUserPosts(username)
  userPosts.unshift(newPost)
  posts.set(username, userPosts)

  return c.json({ success: true, message: '发布成功', post: newPost })
})

app.delete('/api/posts/:id', (c) => {
  const username = c.req.query('username')?.trim()
  if (!username) {
    return c.json({ success: false, message: '缺少用户名' }, 400)
  }

  const idParam = c.req.param('id')
  const id = Number(idParam)
  if (!idParam || Number.isNaN(id)) {
    return c.json({ success: false, message: '无效的微博ID' }, 400)
  }

  const userPosts = getUserPosts(username)
  const filtered = userPosts.filter((post) => post.id !== id)
  if (filtered.length === userPosts.length) {
    return c.json({ success: false, message: '微博不存在' }, 404)
  }

  posts.set(username, filtered)
  return c.json({ success: true, message: '删除成功' })
})

app.post('/api/posts/init-samples', async (c) => {
  const body = await c.req.json()
  const username = body.username?.trim()

  if (!username) {
    return c.json({ success: false, message: '缺少用户名' }, 400)
  }

  if (!users.has(username)) {
    return c.json({ success: false, message: '用户不存在' }, 404)
  }

  if (getUserPosts(username).length > 0) {
    return c.json({ success: false, message: '已有微博，无需初始化' }, 409)
  }

  const samples = buildSamplePosts(username)
  posts.set(username, samples)
  return c.json({ success: true, posts: samples })
})

app.notFound((c) => c.json({ success: false, message: 'Not Found' }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, message: err.message || '服务器内部错误' }, 500)
})

export { app }
