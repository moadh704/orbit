<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="`toast-${t.type}`"
          @click="removeToast(t.id)"
        >
          <div class="toast-bar" />
          <div class="toast-icon">
            <component :is="iconFor(t.type)" :size="15" />
          </div>
          <span class="toast-message">{{ t.message }}</span>
          <button class="toast-close" @click.stop="removeToast(t.id)">
            <X :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

const uiStore = useUiStore()
const { toasts } = storeToRefs(uiStore)
const { removeToast } = uiStore

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

function iconFor(type) {
  return ICONS[type] || Info
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  max-width: 360px;
  width: calc(100vw - 48px);
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  pointer-events: all;
  overflow: hidden;
  position: relative;
}

.toast-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 10px 0 0 10px;
}

.toast-success .toast-bar { background: var(--success); }
.toast-error .toast-bar { background: var(--danger); }
.toast-warning .toast-bar { background: var(--warning); }
.toast-info .toast-bar { background: var(--info); }

.toast-icon {
  flex-shrink: 0;
  margin-left: 6px;
}

.toast-success .toast-icon { color: var(--success); }
.toast-error .toast-icon { color: var(--danger); }
.toast-warning .toast-icon { color: var(--warning); }
.toast-info .toast-icon { color: var(--info); }

.toast-message {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.toast-close:hover {
  color: var(--text-secondary);
  background: var(--bg-card-hover);
}
</style>
