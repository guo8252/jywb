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
        <div v-for="(media, index) in post.media" :key="index" class="post-media-item">
          <img v-if="media.type === 'image'" :src="media.data" alt="微博图片" loading="lazy">
          <video v-else :src="media.data" controls preload="metadata"></video>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { formatTime } from '../utils/format'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])

const userStore = useUserStore()

const authorColor = computed(() => userStore.getAvatarColor(props.post.author))
const authorText = computed(() => userStore.getAvatarText(props.post.author))
const canDelete = computed(() => userStore.currentUser?.username === props.post.author)
const hasVideo = computed(() => props.post.media?.some(m => m.type === 'video'))
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
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #e53935;
  background: #ffebee;
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
}

.post-media-item img,
.post-media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 480px) {
  .post-media-item {
    width: calc(50% - 5px);
    height: 140px;
  }
}
</style>
