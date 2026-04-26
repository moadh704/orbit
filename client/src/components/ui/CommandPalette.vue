<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="commandPaletteOpen" class="modal-overlay" @click.self="close">
        <div class="modal-content command-palette">
          <!-- Search input -->
          <div class="cp-search">
            <Search :size="15" class="cp-search-icon" />
            <input
              ref="inputRef"
              v-model="query"
              class="cp-input"
              placeholder="Search pages, projects, actions..."
              @keydown.escape="close"
              @keydown.enter="selectCurrent"
              @keydown.up.prevent="moveUp"
              @keydown.down.prevent="moveDown"
            />
            <kbd class="cp-esc">Esc</kbd>
          </div>

          <div class="cp-results" v-if="groups.length">
            <div v-for="group in groups" :key="group.label" class="cp-group">
              <div class="cp-group-label section-label">{{ group.label }}</div>
              <div
                v-for="(item, idx) in group.items"
                :key="item.id"
                class="cp-item"
                :class="{ 'cp-item-active': flatItems.indexOf(item) === cursor }"
                @mouseenter="cursor = flatItems.indexOf(item)"
                @click="selectItem(item)"
              >
                <component :is="item.icon" :size="14" class="cp-item-icon" />
                <span class="cp-item-label">{{ item.label }}</span>
                <span v-if="item.sub" class="cp-item-sub">{{ item.sub }}</span>
                <kbd v-if="item.shortcut" class="cp-shortcut">{{ item.shortcut }}</kbd>
              </div>
            </div>
          </div>

          <div v-else class="cp-empty">
            <SearchX :size="20" />
            <span>No results for "{{ query }}"</span>
          </div>

          <div class="cp-footer">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, SearchX,
  LayoutDashboard, FolderOpen, Settings, Users,
  Plus, FolderPlus
} from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const uiStore = useUiStore()
const projectsStore = useProjectsStore()
const { commandPaletteOpen } = storeToRefs(uiStore)
const { projects } = storeToRefs(projectsStore)
const router = useRouter()

const query = ref('')
const cursor = ref(0)
const inputRef = ref(null)

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/', shortcut: 'G D' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, to: '/projects', shortcut: 'G P' },
  { id: 'settings', label: 'Settings', icon: Settings, to: '/settings', shortcut: 'G S' }
]

const ACTION_ITEMS = [
  { id: 'new-project', label: 'New Project', icon: FolderPlus, action: 'new-project' }
]

const groups = computed(() => {
  const q = query.value.toLowerCase()
  const result = []

  const navFiltered = NAV_ITEMS.filter(i => !q || i.label.toLowerCase().includes(q))
  if (navFiltered.length) result.push({ label: 'Navigation', items: navFiltered })

  const projFiltered = projects.value
    .filter(p => !q || p.name.toLowerCase().includes(q))
    .slice(0, 6)
    .map(p => ({
      id: `proj-${p.id}`,
      label: p.name,
      sub: p.description,
      icon: FolderOpen,
      to: `/projects/${p.id}`
    }))
  if (projFiltered.length) result.push({ label: 'Projects', items: projFiltered })

  const actFiltered = ACTION_ITEMS.filter(i => !q || i.label.toLowerCase().includes(q))
  if (actFiltered.length) result.push({ label: 'Actions', items: actFiltered })

  return result
})

const flatItems = computed(() => groups.value.flatMap(g => g.items))

function moveUp() {
  cursor.value = Math.max(0, cursor.value - 1)
}
function moveDown() {
  cursor.value = Math.min(flatItems.value.length - 1, cursor.value + 1)
}
function selectCurrent() {
  const item = flatItems.value[cursor.value]
  if (item) selectItem(item)
}

function selectItem(item) {
  close()
  if (item.to) router.push(item.to)
}

function close() {
  uiStore.closeCommandPalette()
  query.value = ''
  cursor.value = 0
}

watch(commandPaletteOpen, async (open) => {
  if (open) {
    query.value = ''
    cursor.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(query, () => { cursor.value = 0 })
</script>

<style scoped>
.command-palette {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  overflow: hidden;
}

.cp-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.cp-search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.cp-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--text-primary);
}

.cp-input::placeholder {
  color: var(--text-muted);
}

.cp-esc {
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 5px;
  color: var(--text-muted);
}

.cp-results {
  max-height: 380px;
  overflow-y: auto;
  padding: 8px;
}

.cp-group {
  margin-bottom: 8px;
}

.cp-group-label {
  padding: 4px 8px 6px;
}

.cp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 100ms;
}

.cp-item-active,
.cp-item:hover {
  background: var(--bg-card-hover);
}

.cp-item-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.cp-item-label {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
}

.cp-item-sub {
  font-size: 11px;
  color: var(--text-muted);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-shortcut {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 5px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.cp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.cp-footer {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
}

.cp-footer kbd {
  font-family: 'JetBrains Mono', monospace;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  margin-right: 4px;
}
</style>
