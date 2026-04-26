<template>
  <div class="project-view">
    <!-- Project header -->
    <div v-if="project" class="pv-header">
      <div class="pv-header-left">
        <div class="pv-color-dot" :style="{ background: project.color || 'var(--accent)' }" />
        <div class="pv-meta">
          <p v-if="project.description" class="pv-desc">{{ project.description }}</p>
          <div class="pv-stats">
            <span class="pv-stat">
              <CheckSquare :size="12" />
              {{ completedCount }}/{{ totalCount }} tasks
            </span>
            <span v-if="project.due_date" class="pv-stat" :class="{ overdue: isOverdue }">
              <Calendar :size="12" />
              Due {{ formatDate(project.due_date) }}
            </span>
            <span class="pv-stat">
              <Users :size="12" />
              {{ memberCount }} members
            </span>
          </div>
        </div>
      </div>

      <div class="pv-header-right">
        <RouterLink :to="`/projects/${projectId}/members`" class="btn btn-secondary">
          <Users :size="14" />
          Members
        </RouterLink>
        <button class="btn btn-primary" @click="showCreate = true">
          <Plus :size="14" />
          Add task
        </button>
        <button class="btn btn-ghost icon-btn" @click="showSettings = !showSettings" title="Project settings">
          <Settings :size="14" />
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="totalCount > 0" class="pv-progress-wrap">
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{
            width: progressPct + '%',
            background: project?.color || 'var(--accent)'
          }"
        />
      </div>
      <span class="pv-progress-pct mono">{{ progressPct }}%</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="board-loading">
      <div v-for="i in 4" :key="i" class="col-skeleton">
        <div class="skeleton" style="height: 28px; width: 120px; border-radius: 6px; margin-bottom: 12px;" />
        <div v-for="j in 3" :key="j" class="skeleton" style="height: 88px; border-radius: 8px; margin-bottom: 8px;" />
      </div>
    </div>

    <!-- Kanban board -->
    <KanbanBoard
      v-else
      :project-id="projectId"
      @add-task="openCreate"
      @open-task="openTask"
    />

    <!-- Task detail slide-over -->
    <TaskDetailPanel
      :task="selectedTask"
      :project-id="projectId"
      :members="members"
      @close="closeTask"
      @deleted="closeTask"
    />

    <!-- Create task modal -->
    <CreateTaskModal
      v-if="showCreate"
      :project-id="projectId"
      :default-status="createStatus"
      :members="members"
      @close="showCreate = false"
      @created="showCreate = false"
    />

    <!-- Project settings panel -->
    <Transition name="slide-over">
      <div v-if="showSettings" class="slide-over-wrapper">
        <div class="slide-over-backdrop" @click="showSettings = false" />
        <div class="slide-over-panel">
          <div class="panel-header">
            <span style="font-size:14px;font-weight:600">Project Settings</span>
            <button class="btn btn-ghost icon-btn" @click="showSettings = false">
              <X :size="16" />
            </button>
          </div>
          <div class="settings-body">
            <div class="field">
              <label class="label">Project name</label>
              <input v-model="settingsForm.name" class="input" />
            </div>
            <div class="field">
              <label class="label">Description</label>
              <textarea v-model="settingsForm.description" class="input" rows="3" />
            </div>
            <div class="field">
              <label class="label">Status</label>
              <select v-model="settingsForm.status" class="input">
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Due date</label>
              <input v-model="settingsForm.due_date" type="date" class="input" />
            </div>
            <div class="settings-actions">
              <button class="btn btn-primary" @click="saveSettings" :disabled="savingSettings">
                <LoadingSpinner v-if="savingSettings" :size="13" />
                Save changes
              </button>
              <button class="btn btn-danger" @click="confirmDeleteProject">
                <Trash2 :size="13" />
                Delete project
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckSquare, Calendar, Users, Plus, Settings, X, Trash2 } from 'lucide-vue-next'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useMembersStore } from '@/stores/members'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { getSocket } from '@/lib/socket'
import KanbanBoard from '@/components/tasks/KanbanBoard.vue'
import TaskDetailPanel from '@/components/tasks/TaskDetailPanel.vue'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => route.params.id)

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const membersStore = useMembersStore()
const uiStore = useUiStore()

const { currentProject: project } = storeToRefs(projectsStore)
const { tasks, loading } = storeToRefs(tasksStore)
const { members } = storeToRefs(membersStore)
const { selectedTask } = storeToRefs(tasksStore)

const showCreate = ref(false)
const createStatus = ref('todo')
const showSettings = ref(false)
const savingSettings = ref(false)

const settingsForm = reactive({
  name: '',
  description: '',
  status: 'active',
  due_date: '',
  color: ''
})

const totalCount = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'done').length)
const progressPct = computed(() => totalCount.value ? Math.round(completedCount.value / totalCount.value * 100) : 0)
const memberCount = computed(() => members.value.length)

const isOverdue = computed(() => {
  if (!project.value?.due_date) return false
  return new Date(project.value.due_date) < new Date()
})

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function openCreate(status = 'todo') {
  createStatus.value = status
  showCreate.value = true
}

function openTask(task) {
  tasksStore.selectTask(task)
}

function closeTask() {
  tasksStore.clearSelectedTask()
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await projectsStore.updateProject(projectId.value, {
      name: settingsForm.name,
      description: settingsForm.description,
      status: settingsForm.status,
      due_date: settingsForm.due_date || null,
      color: settingsForm.color
    })
    uiStore.success('Project updated')
    showSettings.value = false
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to update project')
  } finally {
    savingSettings.value = false
  }
}

async function confirmDeleteProject() {
  const ok = await uiStore.confirm(
    'Delete project',
    `Delete "${project.value?.name}"? All tasks and data will be permanently removed.`,
    'Delete project',
    'danger'
  )
  if (!ok) return
  try {
    await projectsStore.deleteProject(projectId.value)
    uiStore.success('Project deleted')
    router.push('/projects')
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to delete project')
  }
}

watch(project, (p) => {
  if (p) {
    Object.assign(settingsForm, {
      name: p.name || '',
      description: p.description || '',
      status: p.status || 'active',
      due_date: p.due_date ? p.due_date.slice(0, 10) : '',
      color: p.color || '#7C5CFF'
    })
  }
})

// Socket.io real-time
let socket
onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProject(projectId.value),
    tasksStore.fetchTasks(projectId.value),
    membersStore.fetchMembers(projectId.value)
  ])

  socket = getSocket()
  socket.emit('join-project', projectId.value)

  socket.on('task-created', () => tasksStore.fetchTasks(projectId.value))
  socket.on('task-updated', () => tasksStore.fetchTasks(projectId.value))
  socket.on('task-moved', () => tasksStore.fetchTasks(projectId.value))
  socket.on('task-deleted', () => tasksStore.fetchTasks(projectId.value))
})

onUnmounted(() => {
  if (socket) {
    socket.emit('leave-project', projectId.value)
    socket.off('task-created')
    socket.off('task-updated')
    socket.off('task-moved')
    socket.off('task-deleted')
  }
})
</script>

<style scoped>
.project-view { }

.pv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pv-header-left { display: flex; align-items: flex-start; gap: 12px; }

.pv-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.pv-meta { display: flex; flex-direction: column; gap: 6px; }

.pv-desc { font-size: 13px; color: var(--text-secondary); }

.pv-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.pv-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.pv-stat.overdue { color: var(--danger); }

.pv-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.icon-btn { width: 32px; height: 32px; padding: 0; justify-content: center; }

.pv-progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.pv-progress-wrap .progress-track { flex: 1; }

.pv-progress-pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  width: 36px;
  text-align: right;
}

/* Loading skeleton */
.board-loading {
  display: flex;
  gap: 20px;
  overflow-x: auto;
}

.col-skeleton { width: 280px; min-width: 280px; }

/* Settings panel */
.slide-over-wrapper {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
}

.slide-over-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
}

.slide-over-panel {
  position: relative;
  width: 380px;
  max-width: calc(100vw - 48px);
  height: 100%;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.mono { font-family: 'JetBrains Mono', monospace; }
.overdue { color: var(--danger) !important; }
</style>
