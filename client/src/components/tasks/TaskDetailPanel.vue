<template>
  <Teleport to="body">
    <Transition name="slide-over">
      <div v-if="task" class="slide-over-wrapper">
        <div class="slide-over-backdrop" @click="$emit('close')" />
        <div class="slide-over-panel">
          <!-- Header -->
          <div class="panel-header">
            <div class="panel-header-left">
              <span class="panel-task-id mono">{{ formatId(task.id) }}</span>
              <StatusBadge :status="task.status" />
            </div>
            <div class="panel-header-actions">
              <button
                class="btn btn-ghost icon-btn"
                @click="confirmDelete"
                title="Delete task"
              >
                <Trash2 :size="14" />
              </button>
              <button class="btn btn-ghost icon-btn" @click="$emit('close')" title="Close">
                <X :size="16" />
              </button>
            </div>
          </div>

          <div class="panel-body">
            <!-- Title -->
            <div class="panel-title-section">
              <textarea
                v-model="editForm.title"
                class="panel-title-input"
                placeholder="Task title"
                rows="2"
                @blur="saveTitle"
              />
            </div>

            <!-- Description -->
            <div class="panel-section">
              <label class="label">Description</label>
              <textarea
                v-model="editForm.description"
                class="input panel-desc-input"
                placeholder="Add a description..."
                rows="4"
                @blur="saveDescription"
              />
            </div>

            <!-- Metadata grid -->
            <div class="panel-meta-grid">
              <!-- Status -->
              <div class="meta-item">
                <label class="label">Status</label>
                <select v-model="editForm.status" class="input" @change="saveField('status')">
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <!-- Priority -->
              <div class="meta-item">
                <label class="label">Priority</label>
                <select v-model="editForm.priority" class="input" @change="saveField('priority')">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <!-- Assignee -->
              <div class="meta-item">
                <label class="label">Assignee</label>
                <select v-model="editForm.assignee_id" class="input" @change="saveField('assignee_id')">
                  <option :value="null">Unassigned</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
              </div>

              <!-- Due date -->
              <div class="meta-item">
                <label class="label">Due date</label>
                <input
                  v-model="editForm.due_date"
                  type="date"
                  class="input"
                  @change="saveField('due_date')"
                />
              </div>
            </div>

            <!-- Creator info -->
            <div class="panel-creator" v-if="task.creator_name">
              <UserCircle2 :size="13" />
              <span>Created by <strong>{{ task.creator_name }}</strong></span>
              <span class="mono text-muted">{{ formatDateTime(task.created_at) }}</span>
            </div>

            <!-- Comments -->
            <div class="panel-section">
              <div class="comments-header">
                <MessageSquare :size="14" />
                <span class="label" style="margin-bottom:0">Comments</span>
                <span class="comments-count">{{ comments.length }}</span>
              </div>

              <!-- Comment list -->
              <div v-if="comments.length" class="comments-list" v-auto-animate>
                <div v-for="c in comments" :key="c.id" class="comment">
                  <UserAvatar :name="c.user_name" :size="26" />
                  <div class="comment-body">
                    <div class="comment-meta">
                      <span class="comment-author">{{ c.user_name }}</span>
                      <span class="comment-time mono">{{ formatDateTime(c.created_at) }}</span>
                    </div>
                    <p class="comment-text">{{ c.content }}</p>
                  </div>
                </div>
              </div>

              <div v-else class="comments-empty">
                No comments yet. Be the first to add one.
              </div>

              <!-- Add comment -->
              <div class="comment-form">
                <UserAvatar :name="currentUser?.name || ''" :size="26" />
                <div class="comment-input-wrap">
                  <textarea
                    v-model="newComment"
                    class="input comment-input"
                    placeholder="Add a comment..."
                    rows="2"
                    @keydown.ctrl.enter.prevent="submitComment"
                    @keydown.meta.enter.prevent="submitComment"
                  />
                  <div class="comment-actions">
                    <span class="comment-hint">⌘↵ to submit</span>
                    <button
                      class="btn btn-primary"
                      :disabled="!newComment.trim() || submitting"
                      @click="submitComment"
                    >
                      <LoadingSpinner v-if="submitting" :size="12" />
                      <Send v-else :size="12" />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { X, Trash2, MessageSquare, Send, UserCircle2 } from 'lucide-vue-next'
import { useTasksStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const props = defineProps({
  task: { type: Object, default: null },
  projectId: { type: [String, Number], required: true },
  members: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'deleted'])

const tasksStore = useTasksStore()
const authStore = useAuthStore()
const uiStore = useUiStore()
const { user: currentUser } = storeToRefs(authStore)

const comments = ref([])
const newComment = ref('')
const submitting = ref(false)

const editForm = reactive({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee_id: null,
  due_date: ''
})

watch(() => props.task, (task) => {
  if (task) {
    Object.assign(editForm, {
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignee_id: task.assignee_id || null,
      due_date: task.due_date ? task.due_date.slice(0, 10) : ''
    })
    loadComments()
  }
}, { immediate: true })

async function loadComments() {
  if (!props.task) return
  try {
    comments.value = await tasksStore.fetchComments(props.projectId, props.task.id)
  } catch { /* silent */ }
}

async function saveTitle() {
  if (!editForm.title.trim()) return
  if (editForm.title === props.task?.title) return
  try {
    await tasksStore.updateTask(props.projectId, props.task.id, { ...editForm })
  } catch { uiStore.error('Failed to update task') }
}

async function saveDescription() {
  if (editForm.description === (props.task?.description || '')) return
  try {
    await tasksStore.updateTask(props.projectId, props.task.id, { ...editForm })
  } catch { uiStore.error('Failed to update task') }
}

async function saveField(field) {
  try {
    await tasksStore.updateTask(props.projectId, props.task.id, { ...editForm })
    uiStore.success('Task updated')
  } catch { uiStore.error('Failed to update task') }
}

async function submitComment() {
  if (!newComment.value.trim() || submitting.value) return
  submitting.value = true
  try {
    await tasksStore.addComment(props.projectId, props.task.id, newComment.value.trim())
    newComment.value = ''
    await loadComments()
  } catch { uiStore.error('Failed to add comment') }
  finally { submitting.value = false }
}

async function confirmDelete() {
  const ok = await uiStore.confirm(
    'Delete task',
    `Delete "${props.task?.title}"? This cannot be undone.`,
    'Delete',
    'danger'
  )
  if (!ok) return
  try {
    await tasksStore.deleteTask(props.projectId, props.task.id)
    uiStore.success('Task deleted')
    emit('deleted')
  } catch { uiStore.error('Failed to delete task') }
}

function formatId(id) {
  return `#${String(id).padStart(3, '0')}`
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.slide-over-wrapper {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
}

.slide-over-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
}

.slide-over-panel {
  position: relative;
  width: 420px;
  max-width: calc(100vw - 48px);
  height: 100%;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-task-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  justify-content: center;
}

/* Body */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-title-section { }

.panel-title-input {
  width: 100%;
  background: none;
  border: none;
  outline: none;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.3;
  resize: none;
  padding: 4px 0;
}

.panel-section { display: flex; flex-direction: column; gap: 8px; }

.panel-desc-input { font-size: 13px; }

.panel-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.meta-item { display: flex; flex-direction: column; gap: 5px; }

.panel-creator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 8px 0;
  border-top: 1px solid var(--border);
}

.panel-creator strong {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Comments */
.comments-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
}

.comments-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 0 5px;
  height: 16px;
  display: inline-flex;
  align-items: center;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment {
  display: flex;
  gap: 10px;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
}

.comment-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.comments-empty {
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
}

.comment-form {
  display: flex;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.comment-input-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-input {
  font-size: 13px;
  resize: none;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.mono { font-family: 'JetBrains Mono', monospace; }
.text-muted { color: var(--text-muted); }
</style>
