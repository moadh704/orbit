<template>
  <RouterLink :to="`/projects/${project.id}`" class="project-card">
    <!-- Header -->
    <div class="pc-header">
      <div class="pc-color-bar" :style="{ background: project.color || 'var(--accent)' }" />
      <div class="pc-header-content">
        <div class="pc-title-row">
          <span class="pc-title">{{ project.name }}</span>
          <StatusBadge :status="project.status || 'active'" />
        </div>
        <p v-if="project.description" class="pc-desc">{{ project.description }}</p>
      </div>
    </div>

    <!-- Progress -->
    <div class="pc-progress">
      <div class="pc-progress-header">
        <span class="pc-progress-label">Progress</span>
        <span class="pc-progress-pct">{{ progressPct }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: `${progressPct}%`, background: project.color || 'var(--accent)' }"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="pc-footer">
      <div class="pc-stat">
        <CheckSquare :size="13" />
        <span>{{ project.completed_tasks || 0 }}/{{ project.total_tasks || 0 }}</span>
      </div>
      <div class="pc-stat">
        <Users :size="13" />
        <span>{{ project.member_count || 0 }}</span>
      </div>
      <div v-if="project.due_date" class="pc-stat" :class="{ 'pc-overdue': isOverdue }">
        <Calendar :size="13" />
        <span>{{ formatDate(project.due_date) }}</span>
      </div>
      <div class="pc-role-badge">
        <span>{{ project.my_role }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { CheckSquare, Users, Calendar } from 'lucide-vue-next'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps({
  project: { type: Object, required: true }
})

const progressPct = computed(() => {
  const total = props.project.total_tasks || 0
  const done = props.project.completed_tasks || 0
  if (!total) return 0
  return Math.round((done / total) * 100)
})

const isOverdue = computed(() => {
  if (!props.project.due_date) return false
  return new Date(props.project.due_date) < new Date()
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, transform 150ms;
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.pc-color-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
}

.pc-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}

.pc-header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pc-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pc-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.pc-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Progress */
.pc-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pc-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pc-progress-label {
  font-size: 11px;
  color: var(--text-muted);
}

.pc-progress-pct {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
}

/* Footer */
.pc-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.pc-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.pc-stat.pc-overdue {
  color: var(--danger);
}

.pc-role-badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
