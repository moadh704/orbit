<template>
  <div>
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Global UI overlays -->
    <AppToast />
    <ConfirmDialog />
    <CommandPalette />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import CommandPalette from '@/components/ui/CommandPalette.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

onMounted(async () => {
  // Apply persisted theme
  uiStore.initTheme()

  // Rehydrate auth if token exists
  if (authStore.token) {
    try {
      await authStore.fetchMe()
    } catch {
      authStore.logout()
      router.push('/login')
    }
  }

  // Global keyboard shortcuts
  window.addEventListener('keydown', handleGlobalKey)
})

function handleGlobalKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    uiStore.toggleCommandPalette()
  }
  if (e.key === 'Escape') {
    uiStore.closeCommandPalette()
  }
}
</script>
