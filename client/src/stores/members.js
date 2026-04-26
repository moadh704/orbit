import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/axios'

export const useMembersStore = defineStore('members', () => {
  const members = ref([])
  const loading = ref(false)

  async function fetchMembers(projectId) {
    loading.value = true
    try {
      const { data } = await api.get(`/projects/${projectId}/members`)
      members.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function inviteMember(projectId, email, role = 'member') {
    const { data } = await api.post(`/projects/${projectId}/members/invite`, { email, role })
    return data
  }

  async function updateRole(projectId, userId, role) {
    const { data } = await api.put(`/projects/${projectId}/members/${userId}/role`, { role })
    const idx = members.value.findIndex(m => m.id === userId)
    if (idx !== -1) members.value[idx].role = role
    return data
  }

  async function removeMember(projectId, userId) {
    const { data } = await api.delete(`/projects/${projectId}/members/${userId}`)
    members.value = members.value.filter(m => m.id !== userId)
    return data
  }

  return {
    members, loading,
    fetchMembers, inviteMember, updateRole, removeMember
  }
})
