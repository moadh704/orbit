<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content create-project-modal">
          <div class="modal-header">
            <h2>New Project</h2>
            <button class="btn btn-ghost icon-btn" @click="$emit('close')">
              <X :size="16" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- Name -->
            <div class="field">
              <label class="label">Project name <span class="required">*</span></label>
              <input
                v-model="form.name"
                class="input"
                placeholder="My awesome project"
                required
                autofocus
              />
            </div>

            <!-- Description -->
            <div class="field">
              <label class="label">Description</label>
              <textarea
                v-model="form.description"
                class="input"
                placeholder="What is this project about?"
                rows="3"
              />
            </div>

            <!-- Color + Due date row -->
            <div class="field-row">
              <div class="field">
                <label class="label">Color</label>
                <div class="color-picker">
                  <button
                    v-for="c in COLORS"
                    :key="c"
                    type="button"
                    class="color-swatch"
                    :class="{ selected: form.color === c }"
                    :style="{ background: c }"
                    @click="form.color = c"
                  />
                </div>
              </div>

              <div class="field">
                <label class="label">Due date</label>
                <input
                  v-model="form.due_date"
                  type="date"
                  class="input"
                />
              </div>
            </div>

            <!-- Preview -->
            <div class="preview-bar" :style="{ background: form.color }" />

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <LoadingSpinner v-if="loading" :size="14" />
                <Plus v-else :size="14" />
                Create project
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import { useProjectsStore } from '@/stores/projects'
import { useUiStore } from '@/stores/ui'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const emit = defineEmits(['close', 'created'])

const projectsStore = useProjectsStore()
const uiStore = useUiStore()
const loading = ref(false)

const COLORS = [
  '#7C5CFF', '#3B82F6', '#06B6D4', '#22C55E',
  '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6',
  '#14B8A6', '#F97316'
]

const form = reactive({
  name: '',
  description: '',
  color: '#7C5CFF',
  due_date: ''
})

async function handleSubmit() {
  if (!form.name.trim()) return
  loading.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      color: form.color,
      due_date: form.due_date || undefined
    }
    await projectsStore.createProject(payload)
    uiStore.success('Project created successfully')
    emit('created')
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to create project')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-project-modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 15px;
  font-weight: 600;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.required {
  color: var(--danger);
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 100ms, border-color 100ms;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.selected {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.preview-bar {
  height: 3px;
  border-radius: 2px;
  transition: background 200ms;
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 4px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  justify-content: center;
  border-radius: 8px;
}
</style>
