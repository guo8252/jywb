<template>
  <EarthBackground />

  <header class="header">
    <div class="container">
      <h1>静言悟本</h1>
      <UserInfo @login="showAuth" @notify="showToast" />
    </div>
  </header>

  <main class="container">
    <PostForm @notify="showToast" />
    <PostList @login="showAuth" @delete="handleDelete" />
  </main>

  <UserAuth v-model="authVisible" @notify="showToast" />
  <Toast ref="toastRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { usePostStore } from './stores/post'
import EarthBackground from './components/EarthBackground.vue'
import UserInfo from './components/UserInfo.vue'
import PostForm from './components/PostForm.vue'
import PostList from './components/PostList.vue'
import UserAuth from './components/UserAuth.vue'
import Toast from './components/Toast.vue'

const userStore = useUserStore()
const postStore = usePostStore()

const authVisible = ref(false)
const toastRef = ref(null)

function showAuth() {
  authVisible.value = true
}

function showToast(message) {
  toastRef.value?.show(message)
}

function handleDelete(id) {
  if (!confirm('确定要删除这条微博吗？')) return
  const result = postStore.deletePost(id)
  showToast(result.message)
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    postStore.loadPosts()
    postStore.initSamplePosts()
  }
})
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  color: white;
  padding: 16px 0;
  box-shadow: 0 2px 8px rgba(13, 71, 161, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 22px;
  font-weight: 600;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
}
</style>
