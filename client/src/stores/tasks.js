import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const selectedTask = ref(null)

  const tasksByStatus = computed(() => {
    const groups = { todo: [], in_progress: [], review: [], done: [] }
    tasks.value.forEach(t => {
      if (groups[t.status]) groups[t.status].push(t)
    })
    Object.values(groups).forEach(g => g.sort((a, b) => a.position - b.position))
    return groups
  })

  async function fetchTasks(projectId) {
    loading.value = true
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`)
      tasks.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function createTask(projectId, payload) {
    const { data } = await api.post(`/projects/${projectId}/tasks`, payload)
    await fetchTasks(projectId)
    return data
  }

  async function updateTask(projectId, taskId, payload) {
    const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, payload)
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...payload }
    }
    return data
  }

  async function moveTask(projectId, taskId, status, position) {
    const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status, position })
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], status, position }
    }
    return data
  }

  async function deleteTask(projectId, taskId) {
    const { data } = await api.delete(`/projects/${projectId}/tasks/${taskId}`)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    if (selectedTask.value?.id === taskId) selectedTask.value = null
    return data
  }

  // Comments
  async function fetchComments(projectId, taskId) {
    const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}/comments`)
    return data
  }

  async function addComment(projectId, taskId, content) {
    const { data } = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content })
    return data
  }

  function selectTask(task) {
    selectedTask.value = task
  }

  function clearSelectedTask() {
    selectedTask.value = null
  }

  return {
    tasks, loading, selectedTask, tasksByStatus,
    fetchTasks, createTask, updateTask, moveTask, deleteTask,
    fetchComments, addComment, selectTask, clearSelectedTask
  }
})
