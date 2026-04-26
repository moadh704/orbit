<template>
  <span class="badge priority-badge" :class="`priority-${priority}`">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: { type: String, default: 'medium' }
})

const PRIORITY_MAP = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
}

const label = computed(() => PRIORITY_MAP[props.priority] || props.priority)
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.priority-critical {
  background: rgba(168, 85, 247, 0.12);
  color: #A855F7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.priority-high {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.priority-medium {
  background: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.priority-low {
  background: rgba(34, 197, 94, 0.12);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}
</style>
