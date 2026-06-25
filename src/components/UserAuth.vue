<template>
  <div v-if="modelValue" class="user-modal" @click.self="close">
    <div class="user-modal-content">
      <h2>{{ isRegister ? '用户注册' : '用户登录' }}</h2>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="username" type="text" placeholder="请输入用户名" maxlength="20" @keyup.enter="submit">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码（可选）" maxlength="20" @keyup.enter="submit">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="toggleMode">{{ isRegister ? '去登录' : '去注册' }}</button>
        <button class="btn btn-primary" @click="submit">{{ isRegister ? '注册' : '登录' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostStore } from '../stores/post'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'notify'])

const userStore = useUserStore()
const postStore = usePostStore()

const username = ref('')
const password = ref('')
const isRegister = ref(false)

watch(() => props.modelValue, (val) => {
  if (val) {
    username.value = ''
    password.value = ''
    isRegister.value = false
  }
})

function close() {
  emit('update:modelValue', false)
}

function toggleMode() {
  isRegister.value = !isRegister.value
}

async function submit() {
  const result = isRegister.value
    ? await userStore.register(username.value, password.value)
    : await userStore.login(username.value, password.value)

  if (result.success) {
    await postStore.loadPosts()
    await postStore.initSamplePosts()
    close()
  }

  emit('notify', result.message)
}
</script>

<style scoped>
.user-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 300;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.user-modal-content {
  background: white;
  padding: 28px;
  border-radius: 16px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.user-modal-content h2 {
  margin-bottom: 20px;
  color: #0d47a1;
  text-align: center;
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 12px;
}
</style>
