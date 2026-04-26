<template>
  <div class="projects-page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Projects</h2>
        <p class="page-subtitle">{{ projects.length }} project{{ projects.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn btn-primary" @click="showCreate = true">
        <Plus :size="14" />
        New project
      </button>
    </div>

    <!-- Filter/sort bar -->
    <div class="filter-bar">
      <div class="search-wrap">
        <Search :size="13" class="search-icon" />
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="Filter projects..."
        />
      </div>
      <div class="sort-btns">
        <button
          v-for="s in sortOptions"
          :key="s.key"
          class="sort-btn"
          :class="{ active: sortBy === s.key }"
          @click="sortBy = s.key"
        >{{ s.label }}</button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="projects-grid">
      <div v-for="i in 6" :key="i" class="skeleton" style="height: 180px; border-radius: 12px;" />
    </div>

    <!-- Projects grid -->
    <div v-else-if="filtered.length" class="projects-grid" v-auto-animate>
      <ProjectCard v-for="p in filtered" :key="p.id" :project="p" />
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <FolderOpen :size="28" />
      </div>
      <h3>No projects yet</h3>
      <p>Create your first project to get started with your team</p>
      <button class="btn btn-primary" @click="showCreate = true">
        <Plus :size="14" />
        Create project
      </button>
    </div>

    <CreateProjectModal
      v-if="showCreate"
      @close="showCreate = false"
      @created="showCreate = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, FolderOpen } from 'lucide-vue-next'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import CreateProjectModal from '@/components/projects/CreateProjectModal.vue'

const projectsStore = useProjectsStore()
const { projects, loading } = storeToRefs(projectsStore)

const showCreate = ref(false)
const searchQuery = ref('')
const sortBy = ref('recent')

const sortOptions = [
  { key: 'recent', label: 'Recent' },
  { key: 'name', label: 'Name' },
  { key: 'progress', label: 'Progress' }
]

const filtered = computed(() => {
  let list = [...projects.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }

  if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'progress') {
    list.sort((a, b) => {
      const pa = a.total_tasks ? a.completed_tasks / a.total_tasks : 0
      const pb = b.total_tasks ? b.completed_tasks / b.total_tasks : 0
      return pb - pa
    })
  }

  return list
})

onMounted(() => projectsStore.fetchProjects())
</script>

<style scoped>
.projects-page { }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 3px;
}

.page-subtitle { font-size: 13px; color: var(--text-muted); }

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 32px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 10px 0 30px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 150ms;
}

.search-input:focus { border-color: var(--accent-border); }
.search-input::placeholder { color: var(--text-muted); }

.sort-btns {
  display: flex;
  gap: 4px;
}

.sort-btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 100ms;
}

.sort-btn.active {
  background: var(--accent-dim);
  border-color: var(--accent-border);
  color: var(--accent);
}

.sort-btn:hover:not(.active) {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  color: var(--text-secondary);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 300px;
}
</style>
