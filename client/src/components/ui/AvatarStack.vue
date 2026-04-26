<template>
  <div class="avatar-stack">
    <UserAvatar
      v-for="member in visible"
      :key="member.id"
      :name="member.name"
      :size="size"
      class="avatar-stack-item"
    />
    <div
      v-if="overflow > 0"
      class="avatar-overflow"
      :style="overflowStyle"
      :title="`+${overflow} more`"
    >+{{ overflow }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'

const props = defineProps({
  members: { type: Array, default: () => [] },
  max: { type: Number, default: 3 },
  size: { type: Number, default: 24 }
})

const visible = computed(() => props.members.slice(0, props.max))
const overflow = computed(() => Math.max(0, props.members.length - props.max))

const overflowStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  minWidth: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.34)}px`
}))
</script>

<style scoped>
.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-stack-item {
  margin-left: -6px;
  border: 2px solid var(--bg-card);
  border-radius: 50%;
}

.avatar-stack-item:first-child {
  margin-left: 0;
}

.avatar-overflow {
  margin-left: -6px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
