<template>
  <div class="members-page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Team Members</h2>
        <p class="page-subtitle">
          {{ members.length }} member{{ members.length !== 1 ? 's' : '' }}
          <span v-if="project"> in {{ project.name }}</span>
        </p>
      </div>
      <div class="header-actions">
        <RouterLink :to="`/projects/${projectId}`" class="btn btn-secondary">
          <ArrowLeft :size="14" />
          Back to board
        </RouterLink>
        <button
          v-if="canManage"
          class="btn btn-primary"
          @click="showInvite = true"
        >
          <UserPlus :size="14" />
          Invite member
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="members-table">
      <div v-for="i in 3" :key="i" class="skeleton" style="height: 56px; border-radius: 8px; margin-bottom: 4px;" />
    </div>

    <!-- Members table -->
    <div v-else class="members-table">
      <div class="table-header">
        <span class="th" style="flex:1">Member</span>
        <span class="th" style="width:100px">Role</span>
        <span class="th" style="width:120px">Joined</span>
        <span class="th" style="width:80px"></span>
      </div>

      <div v-auto-animate>
        <div
          v-for="member in members"
          :key="member.id"
          class="table-row"
        >
          <div class="td member-cell" style="flex:1">
            <UserAvatar :name="member.name" :size="32" />
            <div class="member-info">
              <span class="member-name">{{ member.name }}</span>
              <span class="member-email mono">{{ member.email }}</span>
            </div>
            <span v-if="member.id === currentUser?.id" class="you-badge">You</span>
          </div>

          <div class="td" style="width:100px">
            <RoleBadge :role="member.role" />
          </div>

          <div class="td mono" style="width:120px; color: var(--text-muted); font-size: 11px;">
            {{ formatDate(member.joined_at) }}
          </div>

          <div class="td actions" style="width:80px" v-if="canManage && member.id !== currentUser?.id">
            <button
              v-if="member.role !== 'owner'"
              class="action-btn"
              @click="openRoleMenu(member)"
              title="Change role"
            >
              <ChevronDown :size="13" />
            </button>
            <button
              v-if="member.role !== 'owner'"
              class="action-btn danger"
              @click="handleRemove(member)"
              title="Remove member"
            >
              <UserMinus :size="13" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Role change dropdown -->
    <div v-if="roleMenuTarget" class="role-menu-overlay" @click="roleMenuTarget = null">
      <div
        class="role-menu"
        :style="roleMenuPos"
        @click.stop
      >
        <p class="role-menu-title">Change role for {{ roleMenuTarget.name }}</p>
        <button
          v-for="r in ['manager', 'member']"
          :key="r"
          class="role-option"
          :class="{ active: roleMenuTarget.role === r }"
          @click="changeRole(roleMenuTarget, r)"
        >
          <RoleBadge :role="r" />
        </button>
      </div>
    </div>

    <!-- Invite modal -->
    <Teleport to="body" v-if="showInvite">
      <Transition name="modal">
        <div class="modal-overlay" @click.self="showInvite = false">
          <div class="modal-content invite-modal">
            <div class="modal-header">
              <h3>Invite Member</h3>
              <button class="btn btn-ghost icon-btn" @click="showInvite = false">
                <X :size="16" />
              </button>
            </div>
            <form @submit.prevent="handleInvite" class="invite-form">
              <div class="field">
                <label class="label">Email address</label>
                <input
                  v-model="inviteEmail"
                  type="email"
                  class="input"
                  placeholder="colleague@company.com"
                  required
                  autofocus
                />
              </div>
              <div class="field">
                <label class="label">Role</label>
                <select v-model="inviteRole" class="input">
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div class="invite-actions">
                <button type="button" class="btn btn-secondary" @click="showInvite = false">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="inviting">
                  <LoadingSpinner v-if="inviting" :size="13" />
                  <Send v-else :size="13" />
                  Send invite
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, UserPlus, UserMinus, ChevronDown, X, Send } from 'lucide-vue-next'
import { useMembersStore } from '@/stores/members'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import RoleBadge from '@/components/ui/RoleBadge.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const projectId = computed(() => route.params.id)

const membersStore = useMembersStore()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const { members, loading } = storeToRefs(membersStore)
const { currentProject: project } = storeToRefs(projectsStore)
const { user: currentUser } = storeToRefs(authStore)

const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('member')
const inviting = ref(false)
const roleMenuTarget = ref(null)
const roleMenuPos = ref({})

const canManage = computed(() => {
  const me = members.value.find(m => m.id === currentUser.value?.id)
  return me && ['owner', 'manager'].includes(me.role)
})

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function openRoleMenu(member) {
  roleMenuTarget.value = member
}

async function changeRole(member, role) {
  roleMenuTarget.value = null
  try {
    await membersStore.updateRole(projectId.value, member.id, role)
    uiStore.success(`${member.name}'s role updated to ${role}`)
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to update role')
  }
}

async function handleRemove(member) {
  const ok = await uiStore.confirm(
    'Remove member',
    `Remove ${member.name} from this project?`,
    'Remove',
    'danger'
  )
  if (!ok) return
  try {
    await membersStore.removeMember(projectId.value, member.id)
    uiStore.success(`${member.name} removed from project`)
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to remove member')
  }
}

async function handleInvite() {
  inviting.value = true
  try {
    await membersStore.inviteMember(projectId.value, inviteEmail.value, inviteRole.value)
    uiStore.success(`Invitation sent to ${inviteEmail.value}`)
    inviteEmail.value = ''
    showInvite.value = false
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to send invitation')
  } finally {
    inviting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    membersStore.fetchMembers(projectId.value),
    projectsStore.fetchProject(projectId.value)
  ])
})
</script>

<style scoped>
.members-page { }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 3px;
}

.page-subtitle { font-size: 13px; color: var(--text-muted); }

.header-actions { display: flex; gap: 8px; align-items: center; }

/* Table */
.members-table {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 36px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-app);
}

.th {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.table-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 100ms;
}

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg-card-hover); }

.td {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.member-cell {
  gap: 12px;
  flex-shrink: 1;
  min-width: 0;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.member-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-email {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.you-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--accent);
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.actions { gap: 4px; }

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 100ms;
}
.action-btn:hover { background: var(--bg-elevated); color: var(--text-secondary); }
.action-btn.danger:hover { background: var(--danger-dim); color: var(--danger); }

/* Role menu */
.role-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.role-menu {
  position: fixed;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px;
  width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  z-index: 61;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.role-menu-title {
  font-size: 11px;
  color: var(--text-muted);
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 6px;
}

.role-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 100ms;
}

.role-option:hover { background: var(--bg-card-hover); }
.role-option.active { background: var(--accent-dim); }

/* Invite modal */
.invite-modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 { font-size: 14px; font-weight: 600; }

.invite-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }

.invite-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.icon-btn { width: 30px; height: 30px; padding: 0; justify-content: center; }
.mono { font-family: 'JetBrains Mono', monospace; }
</style>
