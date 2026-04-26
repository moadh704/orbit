import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/axios'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const stats = ref(null)
  const logs = ref([])
  const loading = ref(false)

  async function fetchProjects() {
    loading.value = true
    try {
      const { data } = await api.get('/projects')
      projects.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id) {
    const { data } = await api.get(`/projects/${id}`)
    currentProject.value = data
    return data
  }

  async function fetchStats(id) {
    const { data } = await api.get(`/projects/${id}/stats`)
    stats.value = data
    return data
  }

  async function fetchLogs(id) {
    const { data } = await api.get(`/projects/${id}/logs`)
    logs.value = data
    return data
  }

  async function createProject(payload) {
    const { data } = await api.post('/projects', payload)
    await fetchProjects()
    return data
  }

  async function updateProject(id, payload) {
    const { data } = await api.put(`/projects/${id}`, payload)
    await fetchProjects()
    if (currentProject.value?.id === id) {
      await fetchProject(id)
    }
    return data
  }

  async function deleteProject(id) {
    const { data } = await api.delete(`/projects/${id}`)
    projects.value = projects.value.filter(p => p.id !== id)
    if (currentProject.value?.id === id) currentProject.value = null
    return data
  }

  return {
    projects, currentProject, stats, logs, loading,
    fetchProjects, fetchProject, fetchStats, fetchLogs,
    createProject, updateProject, deleteProject
  }
})
