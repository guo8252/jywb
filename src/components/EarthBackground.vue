<template>
  <div class="earth-bg">
    <div class="earth">
      <div class="silhouette"></div>
    </div>
  </div>
  <div class="stars" ref="starsRef"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const starsRef = ref(null)

onMounted(() => {
  const stars = starsRef.value
  if (!stars) return
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div')
    star.className = 'star'
    star.style.left = Math.random() * 100 + '%'
    star.style.top = Math.random() * 100 + '%'
    const size = Math.random() * 2 + 1
    star.style.width = size + 'px'
    star.style.height = size + 'px'
    star.style.animationDelay = Math.random() * 3 + 's'
    stars.appendChild(star)
  }
})
</script>

<style scoped>
.earth-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  z-index: -1;
  pointer-events: none;
  opacity: 0.35;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.earth-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(76, 175, 80, 0.15) 0%, transparent 60%);
}

.earth {
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4caf50 0%, #2e7d32 40%, #1b5e20 100%);
  box-shadow: 0 0 80px rgba(76, 175, 80, 0.4), inset -30px -30px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.earth::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 15%;
  width: 35%;
  height: 25%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 60% 40% 50% 50%;
  transform: rotate(-15deg);
}

.earth::after {
  content: '';
  position: absolute;
  bottom: 25%;
  right: 20%;
  width: 30%;
  height: 20%;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50% 60% 40% 50%;
  transform: rotate(10deg);
}

.silhouette {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  z-index: 2;
}

.silhouette::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 70px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px 25px 0 0;
}

.silhouette::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  z-index: -1;
  pointer-events: none;
}

:global(.star) {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@media (max-width: 480px) {
  .earth {
    width: 300px;
    height: 300px;
  }
}
</style>
