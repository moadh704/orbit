<template>
  <div
    class="avatar"
    :style="avatarStyle"
    :title="name"
  >
    <span v-if="!src" class="avatar-initials">{{ initials }}</span>
    <img v-else :src="src" :alt="name" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: null },
  size: { type: Number, default: 28 },
  color: { type: String, default: null }
})

const GRADIENTS = [
  ['#7C5CFF', '#A78BFA'],
  ['#3B82F6', '#60A5FA'],
  ['#06B6D4', '#22D3EE'],
  ['#22C55E', '#4ADE80'],
  ['#F59E0B', '#FCD34D'],
  ['#EF4444', '#F87171'],
  ['#EC4899', '#F472B6'],
  ['#8B5CF6', '#C4B5FD'],
  ['#14B8A6', '#2DD4BF'],
  ['#F97316', '#FB923C']
]

function hashName(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const avatarStyle = computed(() => {
  const sz = `${props.size}px`
  const fontSize = `${Math.round(props.size * 0.38)}px`
  const [from, to] = props.color
    ? [props.color, props.color]
    : GRADIENTS[hashName(props.name || '?') % GRADIENTS.length]

  return {
    width: sz,
    height: sz,
    minWidth: sz,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${from}, ${to})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize,
    fontWeight: '600',
    fontFamily: '"DM Sans", sans-serif',
    color: '#fff',
    overflow: 'hidden',
    userSelect: 'none',
    flexShrink: '0'
  }
})
</script>
