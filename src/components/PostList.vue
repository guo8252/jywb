<template>
  <section class="feed">
    <div class="feed-header">
      <div class="feed-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'latest' }" @click="switchTab('latest')">最新动态</button>
        <button class="tab-btn" :class="{ active: activeTab === 'favorites' }" @click="switchTab('favorites')">我的收藏</button>
      </div>
      <span class="feed-count">共 {{ displayedCount }} 条</span>
    </div>

    <div v-if="!userStore.isLoggedIn" class="empty-state">
      <div class="empty-icon">👤</div>
      <p class="empty-text">请先登录或注册，开始你的静言悟本之旅</p>
      <button class="btn btn-primary" @click="$emit('login')">立即登录</button>
    </div>

    <div v-else-if="displayedCount === 0" class="empty-state">
      <div class="empty-icon">{{ activeTab === 'favorites' ? '⭐' : '📝' }}</div>
      <p class="empty-text">{{ activeTab === 'favorites' ? '还没有收藏任何微博，看到喜欢的就点收藏吧！' : '还没有微博，快来发布第一条吧！' }}</p>
    </div>

    <div v-else class="post-list">
      <PostItem v-for="post in displayedPosts" :key="post.id" :post="post" @delete="$emit('delete', $event)" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'
import PostItem from './PostItem.vue'

const userStore = useUserStore()
const postStore = usePostStore()

const activeTab = ref('latest')

const displayedPosts = computed(() => {
  if (activeTab.value === 'favorites') {
    return postStore.favoritePosts || []
  }
  return postStore.sortedPosts
})

const displayedCount = computed(() => displayedPosts.value.length)

async function switchTab(tab) {
  if (tab === activeTab.value) return
  activeTab.value = tab
  if (tab === 'favorites') {
    await postStore.loadFavorites()
  }
}

defineEmits(['login', 'delete'])
</script>

<style scoped>
.feed {
  margin-top: 20px;
  padding-bottom: 40px;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.feed-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #e3f2fd;
  color: #1a73e8;
}

.tab-btn.active {
  background: #1a73e8;
  color: #fff;
}

.feed-count {
  font-size: 13px;
  color: #666;
  background: white;
  padding: 4px 10px;
  border-radius: 12px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #1a73e8;
}

.empty-text {
  font-size: 15px;
  margin-bottom: 16px;
}
</style>
