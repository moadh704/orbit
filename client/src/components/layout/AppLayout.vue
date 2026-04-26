<template>
  <div class="app-layout">
    <AppSidebar @create-project="showCreateProject = true" />

    <main class="app-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Top bar -->
      <header class="app-topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ pageTitle }}</h1>
          <span v-if="pageSubtitle" class="topbar-subtitle">{{ pageSubtitle }}</span>
        </div>
        <div class="topbar-right">
          <button class="btn btn-ghost cmd-btn" @click="toggleCommandPalette">
            <Search :size="14" />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <div class="app-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>

    <!-- Create project modal -->
    <CreateProjectModal
      v-if="showCreateProject"
      @close="showCreateProject = false"
      @created="showCreateProject = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import AppSidebar from './AppSidebar.vue'
import CreateProjectModal from '@/components/projects/CreateProjectModal.vue'

const uiStore = useUiStore()
const projectsStore = useProjectsStore()
const { sidebarCollapsed } = storeToRefs(uiStore)
const { currentProject } = storeToRefs(projectsStore)
const { toggleCommandPalette } = uiStore
const route = useRoute()
const showCreateProject = ref(false)

const PAGE_TITLES = {
  Dashboard: 'Dashboard',
  Projects: 'Projects',
  Settings: 'Settings',
  Members: 'Members',
  NotFound: 'Not Found'
}

const pageTitle = computed(() => {
  if (route.name === 'ProjectView') return currentProject.value?.name || 'Project'
  if (route.name === 'Members') return currentProject.value?.name || 'Project'
  return PAGE_TITLES[route.name] || 'Orbit'
})

const pageSubtitle = computed(() => {
  if (route.name === 'ProjectView') return 'Kanban Board'
  if (route.name === 'Members') return 'Team Members'
  return null
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-app);
}

.app-main {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 200ms ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
}

.app-main.sidebar-collapsed {
  margin-left: 56px;
}

.app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 28px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-app);
  position: sticky;
  top: 0;
  z-index: 20;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.topbar-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.topbar-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cmd-btn {
  gap: 8px;
  padding: 0 10px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.cmd-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-secondary);
  background: var(--bg-card-hover);
}

.cmd-btn kbd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
}

.app-content {
  flex: 1;
  padding: 28px;
  min-width: 0;
}
</style>
