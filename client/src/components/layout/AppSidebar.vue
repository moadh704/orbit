<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-mark">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="4" fill="var(--accent)"/>
          <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="var(--accent)" stroke-width="1.5" fill="none" transform="rotate(-30 16 16)" opacity="0.7"/>
          <circle cx="16" cy="3" r="2" fill="var(--accent)" opacity="0.5"/>
        </svg>
      </div>
      <Transition name="slide-right">
        <span v-if="!sidebarCollapsed" class="logo-text">Orbit</span>
      </Transition>
      <button class="collapse-btn" @click="toggleSidebar" :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <PanelLeftClose v-if="!sidebarCollapsed" :size="14" />
        <PanelLeftOpen v-else :size="14" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <span v-if="!sidebarCollapsed" class="section-label">Workspace</span>
        <RouterLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
          :title="sidebarCollapsed ? item.label : undefined"
        >
          <component :is="item.icon" :size="16" class="nav-icon" />
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <kbd v-if="!sidebarCollapsed && item.shortcut" class="nav-shortcut">{{ item.shortcut }}</kbd>
        </RouterLink>
      </div>

      <!-- Projects section -->
      <div class="nav-section" v-if="projects.length">
        <div v-if="!sidebarCollapsed" class="nav-section-header">
          <span class="section-label">Projects</span>
          <button class="nav-add-btn" @click="$emit('create-project')" title="New project">
            <Plus :size="12" />
          </button>
        </div>
        <RouterLink
          v-for="project in projects.slice(0, 8)"
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="nav-item nav-project"
          :title="sidebarCollapsed ? project.name : undefined"
        >
          <span class="project-dot" :style="{ background: project.color || 'var(--accent)' }" />
          <span v-if="!sidebarCollapsed" class="nav-label">{{ project.name }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- User area -->
    <div class="sidebar-user">
      <UserAvatar :name="user?.name || ''" :size="28" />
      <div v-if="!sidebarCollapsed" class="user-info">
        <span class="user-name">{{ user?.name }}</span>
        <span class="user-role">{{ user?.email }}</span>
      </div>
      <button
        v-if="!sidebarCollapsed"
        class="user-logout"
        @click="handleLogout"
        title="Log out"
      >
        <LogOut :size="14" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, FolderOpen, Settings,
  PanelLeftClose, PanelLeftOpen, Plus, LogOut
} from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import UserAvatar from '@/components/ui/UserAvatar.vue'

defineEmits(['create-project'])

const uiStore = useUiStore()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const { sidebarCollapsed } = storeToRefs(uiStore)
const { user } = storeToRefs(authStore)
const { projects } = storeToRefs(projectsStore)
const { toggleSidebar } = uiStore
const router = useRouter()
const route = useRoute()

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D', exact: true },
  { to: '/projects', label: 'Projects', icon: FolderOpen, shortcut: 'G P' },
  { to: '/settings', label: 'Settings', icon: Settings, shortcut: 'G S' }
]

function isActive(item) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 30;
  transition: width 200ms ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 56px;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 56px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  overflow: hidden;
}

.logo-mark {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.logo-text {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  flex: 1;
  white-space: nowrap;
}

.collapse-btn {
  margin-left: auto;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 100ms, background 100ms;
}
.collapse-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-card-hover);
}

.collapsed .collapse-btn {
  margin-left: 0;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  padding: 0 8px;
  margin-bottom: 4px;
  white-space: nowrap;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 4px;
  margin-bottom: 4px;
}

.nav-add-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 100ms, background 100ms;
}
.nav-add-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-card-hover);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 450;
  transition: background 100ms, color 100ms;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--text-primary);
}

.nav-item.active .nav-icon {
  color: var(--accent);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-shortcut {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  color: var(--text-muted);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 150ms;
}

.nav-item:hover .nav-shortcut {
  opacity: 1;
}

.nav-project {
  gap: 10px;
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* User area */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-card);
  margin: 8px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}

.user-logout {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 100ms, background 100ms;
}
.user-logout:hover {
  color: var(--danger);
  background: var(--danger-dim);
}

/* Collapsed state specifics */
.collapsed .sidebar-user {
  padding: 8px;
  justify-content: center;
}

.collapsed .nav-item {
  padding: 0;
  justify-content: center;
  width: 36px;
  margin: 0 auto;
}
</style>
