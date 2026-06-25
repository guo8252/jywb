<template>
  <div class="user-info">
    <button v-if="!userStore.isLoggedIn" class="btn btn-primary" @click="$emit('login')">登录</button>
    <div v-else class="user-bar">
      <div class="user-avatar" :style="{ background: userStore.getAvatarColor(userStore.currentUsername) }">
        {{ userStore.getAvatarText(userStore.currentUsername) }}
      </div>
      <span class="user-name">{{ userStore.currentUsername }}</span>
      <div class="user-menu">
        <button @click="switchUser">切换用户</button>
        <button @click="logout">退出登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'

const emit = defineEmits(['login', 'notify'])
const userStore = useUserStore()
const postStore = usePostStore()

function switchUser() {
  userStore.logout()
  postStore.loadPosts()
  emit('login')
}

function logout() {
  userStore.logout()
  postStore.loadPosts()
  emit('notify', '已退出登录')
}
</script>

<style scoped>
.user-info {
  position: relative;
}

.user-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s;
  position: relative;
}

.user-bar:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-bar:hover .user-menu {
  display: flex;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  color: white;
  font-size: 14px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 100px;
  overflow: hidden;
  z-index: 200;
}

.user-menu button {
  padding: 10px 16px;
  border: none;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.user-menu button:hover {
  background: #f0f2f5;
  color: #1a73e8;
}
</style>
