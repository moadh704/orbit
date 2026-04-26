<template>
  <svg
    class="spinner"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-dasharray="32"
      stroke-dashoffset="10"
    />
  </svg>
</template>

<script setup>
defineProps({ size: { type: Number, default: 18 } })
</script>

<style scoped>
.spinner {
  animation: spin 0.7s linear infinite;
  color: var(--accent);
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
