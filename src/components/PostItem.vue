<template>
  <article class="post-item">
    <div class="post-header">
      <div class="post-author">
        <div class="avatar" :style="{ background: authorColor }">{{ authorText }}</div>
        <div class="author-info">
          <span class="author-name">{{ post.author }}</span>
          <span class="post-time">{{ formatTime(post.createTime) }}</span>
        </div>
      </div>
      <button v-if="canDelete" class="delete-btn" @click="$emit('delete', post.id)">删除</button>
    </div>

    <div class="post-content">{{ post.content }}</div>

    <div v-if="post.media?.length" class="post-media">
      <span v-if="hasVideo" class="media-type-tag">视频</span>
      <span v-else class="media-type-tag">图片</span>
      <div class="media-list">
        <div v-for="(media, index) in post.media" :key="index" class="post-media-item" :class="{ 'video-item': media.type === 'video' }">
          <img v-if="media.type === 'image'" :src="media.data" alt="微博图片" loading="lazy">
          <video v-else :src="media.data" controls preload="metadata" @error="handleVideoError"></video>
          <div v-if="media.type === 'video' && videoError" class="video-fallback">
            <span class="video-icon">▶</span>
            <span class="video-tip">视频加载失败</span>
          </div>
        </div>
      </div>
    </div>

    <div class="post-actions">
      <button class="action-btn like-btn" :class="{ active: isLiked }" @click="handleLike">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
        <span class="action-count">{{ likeCount }}</span>
      </button>
      <button class="action-btn favorite-btn" :class="{ active: isFavorited }" @click="handleFavorite">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span class="action-count">{{ favoriteCount }}</span>
      </button>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'
import { formatTime } from '../utils/format'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])

const userStore = useUserStore()
const postStore = usePostStore()
const videoError = ref(false)

const authorColor = computed(() => userStore.getAvatarColor(props.post.author))
const authorText = computed(() => userStore.getAvatarText(props.post.author))
const canDelete = computed(() => userStore.currentUser?.username === props.post.author)
const hasVideo = computed(() => props.post.media?.some(m => m.type === 'video'))

const currentUsername = computed(() => userStore.currentUser?.username || '')
const isLiked = computed(() => currentUsername.value && props.post.likes?.includes(currentUsername.value))
const isFavorited = computed(() => currentUsername.value && props.post.favorites?.includes(currentUsername.value))
const likeCount = computed(() => props.post.likes?.length || 0)
const favoriteCount = computed(() => props.post.favorites?.length || 0)

async function handleLike() {
  if (!currentUsername.value) return
  await postStore.toggleLike(props.post.id)
}

async function handleFavorite() {
  if (!currentUsername.value) return
  await postStore.toggleFavorite(props.post.id)
}

function handleVideoError() {
  videoError.value = true
}
</script>

<style scoped>
.post-item {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  animation: slideIn 0.3s ease-out;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.12);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42a5f5 0%, #1a73e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #1a73e8;
  font-size: 15px;
}

.post-time {
  font-size: 12px;
  color: #888;
}

.delete-btn {
  background: #f5f5f5;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #fff;
  background: #e53935;
}

.post-content {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  word-break: break-all;
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.post-media {
  margin-top: 10px;
}

.media-type-tag {
  display: inline-block;
  font-size: 12px;
  color: #1a73e8;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.media-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.post-media-item {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  background: #000;
  position: relative;
}

.post-media-item img,
.post-media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-item video {
  position: relative;
  z-index: 1;
}

.video-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  color: white;
  z-index: 2;
}

.video-icon {
  font-size: 32px;
  margin-bottom: 6px;
  opacity: 0.9;
}

.video-tip {
  font-size: 12px;
  opacity: 0.8;
}

.post-actions {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e3f2fd;
  color: #1a73e8;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.active {
  color: #1a73e8;
}

.action-btn.active .action-icon {
  fill: #1a73e8;
}

.action-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.action-btn:hover .action-icon {
  transform: scale(1.15);
}

.action-count {
  font-weight: 500;
  min-width: 14px;
}

@media (max-width: 480px) {
  .post-media-item {
    width: calc(50% - 5px);
    height: 140px;
  }
}
</style>
