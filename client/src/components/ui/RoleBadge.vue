<template>
  <span class="badge role-badge" :class="`role-${role}`">{{ role }}</span>
</template>

<script setup>
defineProps({ role: { type: String, default: 'member' } })
</script>

<style scoped>
.role-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.role-owner {
  background: rgba(124, 92, 255, 0.12);
  color: var(--accent);
  border: 1px solid var(--accent-border);
}

.role-manager {
  background: rgba(56, 189, 248, 0.12);
  color: #38BDF8;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.role-member {
  background: var(--bg-elevated);
  color: var(--text-muted);
  border: 1px solid var(--border);
}
</style>
