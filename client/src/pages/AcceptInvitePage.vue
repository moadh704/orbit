<template>
  <div class="invite-page">
    <div class="invite-card">
      <h1>{{ heading }}</h1>
      <p>{{ message }}</p>
      <RouterLink v-if="status === 'error'" to="/projects" class="btn btn-primary">
        Back to projects
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/axios'

const route = useRoute()
const router = useRouter()
const status = ref('working')
const message = ref('Accepting invitation…')

const heading = computed(() => {
  if (status.value === 'ok') return 'You are in'
  if (status.value === 'error') return 'Invite not accepted'
  return 'Joining project'
})

onMounted(async () => {
  const token = String(route.params.token || '')
  if (!/^[a-f0-9]{32,128}$/i.test(token)) {
    status.value = 'error'
    message.value = 'This invite link is not valid.'
    return
  }

  try {
    const { data } = await api.post(`/invites/${encodeURIComponent(token)}/accept`)
    status.value = 'ok'
    message.value = data.message || 'Joined the project.'
    const projectId = data.projectId
    router.replace(projectId ? `/projects/${projectId}` : '/')
  } catch (err) {
    status.value = 'error'
    message.value = err.response?.data?.message || 'Could not accept this invitation.'
  }
})
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-app);
  padding: 40px;
}

.invite-card {
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.invite-card h1 {
  font-size: 28px;
  margin: 0;
}

.invite-card p {
  color: var(--text-muted, var(--text-dim));
  margin: 0 0 8px;
}
</style>
