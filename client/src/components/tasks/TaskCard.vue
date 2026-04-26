<template>
  <div class="task-card" @click="$emit('click', task)">
    <!-- Priority indicator -->
    <div class="tc-priority-line" :class="`priority-${task.priority}`" />

    <div class="tc-body">
      <!-- Title -->
      <p class="tc-title">{{ task.title }}</p>

      <!-- Description preview -->
      <p v-if="task.description" class="tc-desc">{{ task.description }}</p>

      <!-- Tags row -->
      <div class="tc-tags">
        <PriorityBadge :priority="task.priority" />
        <div v-if="task.due_date" class="tc-due" :class="{ overdue: isOverdue }">
          <Calendar :size="11" />
          <span>{{ formatDate(task.due_date) }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="tc-footer">
        <div v-if="task.assignee_name" class="tc-assignee">
          <UserAvatar :name="task.assignee_name" :size="20" />
          <span class="tc-assignee-name">{{ task.assignee_name }}</span>
        </div>
        <div v-else class="tc-unassigned">
          <UserCircle2 :size="14" />
          <span>Unassigned</span>
        </div>
        <span class="tc-id mono">{{ formatId(task.id) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar, UserCircle2 } from 'lucide-vue-next'
import PriorityBadge from '@/components/ui/PriorityBadge.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'

const props = defineProps({
  task: { type: Object, required: true }
})
defineEmits(['click'])

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  return new Date(props.task.due_date) < new Date() && props.task.status !== 'done'
})

function formatDate(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days < 7) return `in ${days}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatId(id) {
  return `#${String(id).padStart(3, '0')}`
}
</script>

<style scoped>
.task-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 150ms, transform 150ms;
  overflow: hidden;
  position: relative;
}

.task-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.tc-priority-line {
  height: 2px;
  width: 100%;
}

.priority-critical { background: #A855F7; }
.priority-high { background: #EF4444; }
.priority-medium { background: #F59E0B; }
.priority-low { background: #22C55E; }

.tc-body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tc-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.tc-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tc-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tc-due {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--text-muted);
}

.tc-due.overdue {
  color: var(--danger);
}

.tc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.tc-assignee {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tc-assignee-name {
  font-size: 11px;
  color: var(--text-secondary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tc-unassigned {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.tc-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
}
</style>
