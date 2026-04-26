<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmState.open" class="modal-overlay" @click.self="cancel">
        <div class="modal-content confirm-dialog">
          <div class="confirm-header">
            <div class="confirm-icon" :class="`confirm-icon-${confirmState.confirmVariant}`">
              <AlertTriangle v-if="confirmState.confirmVariant === 'danger'" :size="18" />
              <Info v-else :size="18" />
            </div>
            <div>
              <h3 class="confirm-title">{{ confirmState.title }}</h3>
              <p class="confirm-message">{{ confirmState.message }}</p>
            </div>
          </div>

          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="cancel">Cancel</button>
            <button
              class="btn"
              :class="confirmState.confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'"
              @click="confirm"
            >
              {{ confirmState.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle, Info } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

const uiStore = useUiStore()
const { confirmState } = storeToRefs(uiStore)

function confirm() { uiStore.resolveConfirm(true) }
function cancel() { uiStore.resolveConfirm(false) }
</script>

<style scoped>
.confirm-dialog {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
}

.confirm-header {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.confirm-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.confirm-icon-danger {
  background: var(--danger-dim);
  color: var(--danger);
}

.confirm-icon-info {
  background: var(--info-dim);
  color: var(--info);
}

.confirm-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.confirm-message {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
