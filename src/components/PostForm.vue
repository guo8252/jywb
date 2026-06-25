<template>
  <section class="post-box">
    <textarea v-model="content" placeholder="分享新鲜事..." maxlength="500" @keydown.ctrl.enter="publish"></textarea>

    <div class="media-upload">
      <input ref="fileInput" type="file" accept="image/*,video/*" multiple @change="handleFileChange">
    </div>

    <div v-if="pendingMedia.length" class="media-preview">
      <div v-for="(media, index) in pendingMedia" :key="index" class="media-preview-item">
        <img v-if="media.type === 'image'" :src="media.data" alt="预览">
        <video v-else :src="media.data" muted></video>
        <button class="remove-media" @click="removeMedia(index)">×</button>
      </div>
    </div>

    <div class="post-actions">
      <span class="char-count" :class="{ warning: content.length >= 500 }">{{ content.length }}/500</span>
      <button class="btn btn-primary" @click="publish">发布</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'
import { readFileAsBase64 } from '../utils/format'

const emit = defineEmits(['notify'])

const userStore = useUserStore()
const postStore = usePostStore()

const content = ref('')
const pendingMedia = ref([])
const fileInput = ref(null)

const MAX_FILE_SIZE = 2 * 1024 * 1024
const MAX_MEDIA_PER_POST = 4

async function handleFileChange(e) {
  const files = Array.from(e.target.files)

  if (pendingMedia.value.length + files.length > MAX_MEDIA_PER_POST) {
    emit('notify', `每条微博最多上传 ${MAX_MEDIA_PER_POST} 个媒体文件`)
    fileInput.value.value = ''
    return
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      emit('notify', `文件 ${file.name} 超过2MB限制`)
      continue
    }

    try {
      const data = await readFileAsBase64(file)
      const type = file.type.startsWith('video/') ? 'video' : 'image'
      pendingMedia.value.push({ type, data, name: file.name })
    } catch {
      emit('notify', '读取文件失败')
    }
  }

  fileInput.value.value = ''
}

function removeMedia(index) {
  pendingMedia.value.splice(index, 1)
}

function publish() {
  if (!userStore.isLoggedIn) {
    emit('notify', '请先登录')
    return
  }

  const result = postStore.addPost(content.value, pendingMedia.value)
  emit('notify', result.message)

  if (result.success) {
    content.value = ''
    pendingMedia.value = []
  }
}
</script>

<style scoped>
.post-box {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 3px solid #1a73e8;
}

.post-box textarea {
  width: 100%;
  min-height: 90px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.post-box textarea:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.media-upload {
  margin-top: 12px;
  padding: 12px;
  border: 2px dashed #bbdefb;
  border-radius: 8px;
  background: #f5f9ff;
  transition: border-color 0.2s;
}

.media-upload:hover {
  border-color: #1a73e8;
}

.media-upload input[type="file"] {
  width: 100%;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.media-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.media-preview-item img,
.media-preview-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-media {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-media:hover {
  background: #e53935;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 13px;
  color: #888;
}

.char-count.warning {
  color: #e53935;
}

@media (max-width: 480px) {
  .post-box {
    margin-top: 12px;
    padding: 12px;
  }
}
</style>
