<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content create-task-modal">
          <div class="modal-header">
            <h2>New Task</h2>
            <button class="btn btn-ghost icon-btn" @click="$emit('close')">
              <X :size="16" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- Title -->
            <div class="field">
              <label class="label">Title <span class="required">*</span></label>
              <input
                v-model="form.title"
                class="input"
                placeholder="Task title"
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
                placeholder="Add details..."
                rows="3"
              />
            </div>

            <!-- Row: Status + Priority -->
            <div class="field-row">
              <div class="field">
                <label class="label">Status</label>
                <select v-model="form.status" class="input">
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div class="field">
                <label class="label">Priority</label>
                <select v-model="form.priority" class="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <!-- Row: Assignee + Due date -->
            <div class="field-row">
              <div class="field">
                <label class="label">Assignee</label>
                <select v-model="form.assignee_id" class="input">
                  <option :value="null">Unassigned</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">
                    {{ m.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label class="label">Due date</label>
                <input v-model="form.due_date" type="date" class="input" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <LoadingSpinner v-if="loading" :size="14" />
                <Plus v-else :size="14" />
                Create task
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
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  defaultStatus: { type: String, default: 'todo' },
  members: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'created'])

const tasksStore = useTasksStore()
const uiStore = useUiStore()
const loading = ref(false)

const form = reactive({
  title: '',
  description: '',
  status: props.defaultStatus,
  priority: 'medium',
  assignee_id: null,
  due_date: ''
})

async function handleSubmit() {
  if (!form.title.trim()) return
  loading.value = true
  try {
    await tasksStore.createTask(props.projectId, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      assignee_id: form.assignee_id || undefined,
      due_date: form.due_date || undefined
    })
    uiStore.success('Task created')
    emit('created')
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to create task')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-task-modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 { font-size: 15px; font-weight: 600; }

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.required { color: var(--danger); }

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
}
</style>
