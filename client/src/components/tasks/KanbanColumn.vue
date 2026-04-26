<template>
  <div class="kanban-col">
    <!-- Column header -->
    <div class="col-header">
      <div class="col-title-row">
        <span class="col-dot" :style="{ background: columnColor }" />
        <span class="col-title">{{ column.label }}</span>
        <span class="col-count">{{ tasks.length }}</span>
      </div>
      <button class="col-add-btn" @click="$emit('add', column.key)" :title="`Add task to ${column.label}`">
        <Plus :size="14" />
      </button>
    </div>

    <!-- Droppable list -->
    <VueDraggable
      v-model="localTasks"
      :group="{ name: 'tasks', pull: true, put: true }"
      item-key="id"
      class="col-tasks"
      ghost-class="sortable-ghost"
      drag-class="sortable-drag"
      :animation="150"
      @end="handleDragEnd"
    >
      <template #item="{ element }">
        <TaskCard
          :task="element"
          @click="$emit('open-task', element)"
        />
      </template>
    </VueDraggable>

    <!-- Add task -->
    <button class="col-add-task" @click="$emit('add', column.key)">
      <Plus :size="13" />
      <span>Add task</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Plus } from 'lucide-vue-next'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  column: { type: Object, required: true },
  tasks: { type: Array, default: () => [] },
  projectId: { type: [String, Number], required: true }
})

const emit = defineEmits(['move', 'add', 'open-task', 'update:tasks'])

const COLUMN_COLORS = {
  todo: '#5A5E66',
  in_progress: '#38BDF8',
  review: '#F59E0B',
  done: '#22C55E'
}

const columnColor = computed(() => COLUMN_COLORS[props.column.key] || '#5A5E66')

const localTasks = computed({
  get: () => props.tasks,
  set: (val) => emit('update:tasks', props.column.key, val)
})

function handleDragEnd(evt) {
  const { item, to, newIndex } = evt
  const taskId = parseInt(item.dataset.id || item.querySelector('[data-id]')?.dataset.id)
  const newStatus = to.closest('[data-column]')?.dataset.column || props.column.key

  if (!taskId) return

  emit('move', {
    taskId,
    status: newStatus,
    position: newIndex + 1
  })
}
</script>

<style scoped>
.kanban-col {
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.col-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.col-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.col-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
}

.col-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 0 6px;
  height: 18px;
  display: flex;
  align-items: center;
}

.col-add-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 3px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 100ms, background 100ms;
}
.col-add-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-card-hover);
}

.col-tasks {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 60px;
  padding: 4px 0;
}

.col-add-task {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: 1px dashed var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 100ms, color 100ms, background 100ms;
}

.col-add-task:hover {
  border-color: var(--accent-border);
  color: var(--accent);
  background: var(--accent-dim);
}
</style>
