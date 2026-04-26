<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="col in COLUMNS"
      :key="col.key"
      :column="col"
      :tasks="tasksByStatus[col.key] || []"
      :project-id="projectId"
      :data-column="col.key"
      @move="handleMove"
      @add="(status) => $emit('add-task', status)"
      @open-task="(task) => $emit('open-task', task)"
      @update:tasks="handleColumnUpdate"
    />
  </div>
</template>

<script setup>
import KanbanColumn from './KanbanColumn.vue'
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

const props = defineProps({
  projectId: { type: [String, Number], required: true }
})

const emit = defineEmits(['add-task', 'open-task'])

const tasksStore = useTasksStore()
const uiStore = useUiStore()
const { tasksByStatus } = storeToRefs(tasksStore)

const COLUMNS = [
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' }
]

async function handleMove({ taskId, status, position }) {
  try {
    await tasksStore.moveTask(props.projectId, taskId, status, position)
  } catch (err) {
    uiStore.error('Failed to move task')
    await tasksStore.fetchTasks(props.projectId)
  }
}

function handleColumnUpdate(columnKey, newTasks) {
  // Optimistic column-level reorder — handled by vue-draggable-plus
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: calc(100vh - 180px);
}
</style>
