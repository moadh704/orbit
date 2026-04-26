<template>
  <span class="badge status-badge" :class="`status-${normalizedStatus}`">
    <span class="status-dot" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'todo' }
})

const STATUS_MAP = {
  todo: { label: 'Todo', cls: 'todo' },
  in_progress: { label: 'In Progress', cls: 'in_progress' },
  review: { label: 'Review', cls: 'review' },
  done: { label: 'Done', cls: 'done' },
  active: { label: 'Active', cls: 'in_progress' },
  archived: { label: 'Archived', cls: 'todo' }
}

const normalizedStatus = computed(() => STATUS_MAP[props.status]?.cls || 'todo')
const label = computed(() => STATUS_MAP[props.status]?.label || props.status)
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 7px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-todo {
  background: rgba(90, 94, 102, 0.15);
  color: #9CA0A8;
  border: 1px solid rgba(90, 94, 102, 0.2);
}
.status-todo .status-dot { background: #5A5E66; }

.status-in_progress {
  background: rgba(56, 189, 248, 0.12);
  color: #38BDF8;
  border: 1px solid rgba(56, 189, 248, 0.2);
}
.status-in_progress .status-dot { background: #38BDF8; }

.status-review {
  background: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.status-review .status-dot { background: #F59E0B; }

.status-done {
  background: rgba(34, 197, 94, 0.12);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}
.status-done .status-dot { background: #22C55E; }
</style>
