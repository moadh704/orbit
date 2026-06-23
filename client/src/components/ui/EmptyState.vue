<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">
      <component :is="icon" :size="iconSize" />
    </div>

    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p v-if="description" class="empty-description">{{ description }}</p>

      <div v-if="$slots.default || actionLabel" class="empty-actions">
        <slot>
          <button
            v-if="actionLabel"
            class="btn btn-primary"
            @click="$emit('action')"
          >
            {{ actionLabel }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  icon: {
    type: [Object, Function],
    default: null
  },
  iconSize: {
    type: Number,
    default: 48
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 20px;
  color: var(--text-muted);
  opacity: 0.6;
}

.empty-content {
  max-width: 320px;
}

.empty-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
