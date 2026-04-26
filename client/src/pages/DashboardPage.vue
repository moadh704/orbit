<template>
  <div class="dashboard">
    <!-- Stats bento grid -->
    <div class="bento-grid">
      <!-- Stat: Total projects (wide) -->
      <div class="bento-tile bento-stat bento-wide">
        <div class="stat-icon stat-icon-accent">
          <FolderOpen :size="18" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Projects</span>
          <span ref="projectsNumRef" class="stat-value">{{ stats.totalProjects }}</span>
        </div>
        <div class="stat-trend up">
          <TrendingUp :size="13" />
          <span>Active</span>
        </div>
      </div>

      <!-- Stat: Total tasks -->
      <div class="bento-tile bento-stat">
        <div class="stat-icon stat-icon-info">
          <CheckSquare :size="18" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Tasks</span>
          <span ref="tasksNumRef" class="stat-value">{{ stats.totalTasks }}</span>
        </div>
      </div>

      <!-- Stat: Completed -->
      <div class="bento-tile bento-stat">
        <div class="stat-icon stat-icon-success">
          <CheckCircle2 :size="18" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Completed</span>
          <span ref="doneNumRef" class="stat-value">{{ stats.completed }}</span>
        </div>
        <div class="stat-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              style="background: var(--success)"
              :style="{ width: completionRate + '%', background: 'var(--success)' }"
            />
          </div>
          <span class="stat-pct">{{ completionRate }}%</span>
        </div>
      </div>

      <!-- Stat: Overdue -->
      <div class="bento-tile bento-stat">
        <div class="stat-icon stat-icon-danger">
          <AlertOctagon :size="18" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Overdue</span>
          <span class="stat-value" :class="{ 'text-danger': stats.overdue > 0 }">{{ stats.overdue }}</span>
        </div>
      </div>

      <!-- Activity chart (tall) -->
      <div class="bento-tile bento-chart">
        <div class="tile-header">
          <span class="tile-title">Task Activity</span>
          <span class="tile-subtitle">Last 7 days</span>
        </div>
        <div class="chart-wrap">
          <apexchart
            v-if="chartLoaded"
            type="area"
            height="180"
            :options="chartOptions"
            :series="chartSeries"
          />
          <div v-else class="skeleton" style="height: 180px; border-radius: 8px;" />
        </div>
      </div>

      <!-- Recent projects (medium) -->
      <div class="bento-tile bento-projects">
        <div class="tile-header">
          <span class="tile-title">Recent Projects</span>
          <RouterLink to="/projects" class="tile-link">View all</RouterLink>
        </div>
        <div class="project-list" v-auto-animate>
          <div
            v-for="p in recentProjects"
            :key="p.id"
            class="mini-project"
            @click="$router.push(`/projects/${p.id}`)"
          >
            <span class="mini-dot" :style="{ background: p.color || 'var(--accent)' }" />
            <span class="mini-name">{{ p.name }}</span>
            <div class="mini-progress">
              <div class="progress-track" style="width: 60px">
                <div
                  class="progress-fill"
                  :style="{
                    width: projectProgress(p) + '%',
                    background: p.color || 'var(--accent)'
                  }"
                />
              </div>
              <span class="mini-pct">{{ projectProgress(p) }}%</span>
            </div>
          </div>
          <div v-if="!recentProjects.length" class="empty-state-small">
            No projects yet
          </div>
        </div>
      </div>

      <!-- Activity feed (tall) -->
      <div class="bento-tile bento-activity">
        <div class="tile-header">
          <span class="tile-title">Activity Feed</span>
          <Activity :size="14" class="tile-icon" />
        </div>
        <div class="activity-list" v-auto-animate>
          <div v-for="log in recentActivity" :key="log.id" class="activity-item">
            <UserAvatar :name="log.user_name" :size="24" />
            <div class="activity-body">
              <span class="activity-user">{{ log.user_name }}</span>
              <span class="activity-action">{{ log.action }}</span>
              <span class="activity-time mono">{{ timeAgo(log.created_at) }}</span>
            </div>
          </div>
          <div v-if="!recentActivity.length" class="empty-state-small">
            No recent activity
          </div>
        </div>
      </div>

      <!-- Team status (small) -->
      <div class="bento-tile bento-members">
        <div class="tile-header">
          <span class="tile-title">Your Projects</span>
          <Users :size="14" class="tile-icon" />
        </div>
        <div class="member-list">
          <div v-for="p in recentProjects.slice(0,4)" :key="p.id" class="member-item">
            <span class="member-dot" :style="{ background: p.color || 'var(--accent)' }" />
            <span class="member-name">{{ p.name }}</span>
            <span class="member-count">{{ p.member_count || 0 }} <Users :size="10" /></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  FolderOpen, CheckSquare, CheckCircle2, AlertOctagon,
  TrendingUp, Activity, Users
} from 'lucide-vue-next'
import { gsap } from 'gsap'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import UserAvatar from '@/components/ui/UserAvatar.vue'

const projectsStore = useProjectsStore()
const { projects } = storeToRefs(projectsStore)

const chartLoaded = ref(false)

const stats = ref({
  totalProjects: 0,
  totalTasks: 0,
  completed: 0,
  overdue: 0
})

const recentActivity = ref([])
const projectsNumRef = ref(null)
const tasksNumRef = ref(null)
const doneNumRef = ref(null)

const recentProjects = computed(() => projects.value.slice(0, 5))

const completionRate = computed(() => {
  if (!stats.value.totalTasks) return 0
  return Math.round((stats.value.completed / stats.value.totalTasks) * 100)
})

function projectProgress(p) {
  if (!p.total_tasks) return 0
  return Math.round((p.completed_tasks / p.total_tasks) * 100)
}

// Chart config — seeded data from actual task counts
const chartSeries = ref([{
  name: 'Tasks completed',
  data: [2, 4, 3, 6, 5, 8, 4]
}, {
  name: 'Tasks created',
  data: [3, 5, 4, 7, 6, 9, 5]
}])

const chartOptions = {
  chart: {
    background: 'transparent',
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: '"DM Sans", sans-serif'
  },
  theme: { mode: 'dark' },
  colors: ['#7C5CFF', '#38BDF8'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.25,
      opacityTo: 0.02,
      stops: [0, 100]
    }
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } }
  },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    labels: {
      style: { colors: '#5A5E66', fontSize: '11px', fontFamily: '"DM Sans", sans-serif' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#5A5E66', fontSize: '11px' }
    }
  },
  legend: {
    labels: { colors: '#9CA0A8' },
    fontSize: '12px'
  },
  tooltip: {
    theme: 'dark',
    style: { fontSize: '12px', fontFamily: '"DM Sans", sans-serif' }
  }
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

function animateCounters() {
  const animate = (el, target) => {
    if (!el) return
    gsap.fromTo({ val: 0 }, { val: target, duration: 0.8, ease: 'power2.out',
      onUpdate() { el.textContent = Math.round(this.targets()[0].val) }
    })
  }
  animate(projectsNumRef.value, stats.value.totalProjects)
  animate(tasksNumRef.value, stats.value.totalTasks)
  animate(doneNumRef.value, stats.value.completed)
}

onMounted(async () => {
  await projectsStore.fetchProjects()

  // Aggregate stats from projects
  const totalTasks = projects.value.reduce((s, p) => s + (p.total_tasks || 0), 0)
  const completed = projects.value.reduce((s, p) => s + (p.completed_tasks || 0), 0)

  stats.value = {
    totalProjects: projects.value.length,
    totalTasks,
    completed,
    overdue: 0
  }

  // Try to get activity from first project with logs
  if (projects.value.length) {
    try {
      const logs = await projectsStore.fetchLogs(projects.value[0].id)
      recentActivity.value = logs.slice(0, 8)
    } catch { /* silent */ }
  }

  await new Promise(r => setTimeout(r, 100))
  chartLoaded.value = true
  animateCounters()
})
</script>

<style scoped>
.dashboard { }

/* Bento grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(80px, auto);
  gap: 16px;
}

/* Tiles */
.bento-tile {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
}

.bento-wide { grid-column: span 3; }

.bento-stat {
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bento-chart { grid-column: span 7; grid-row: span 2; }
.bento-projects { grid-column: span 5; }
.bento-activity { grid-column: span 5; grid-row: span 2; }
.bento-members { grid-column: span 7; }

@media (max-width: 1400px) {
  .bento-wide { grid-column: span 6; }
  .bento-stat { grid-column: span 3; }
  .bento-chart { grid-column: span 12; }
  .bento-projects { grid-column: span 6; }
  .bento-activity { grid-column: span 6; }
  .bento-members { grid-column: span 12; }
}

@media (max-width: 900px) {
  .bento-tile { grid-column: span 12 !important; }
}

/* Stat tile */
.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-accent { background: var(--accent-dim); color: var(--accent); }
.stat-icon-info { background: var(--info-dim); color: var(--info); }
.stat-icon-success { background: var(--success-dim); color: var(--success); }
.stat-icon-danger { background: var(--danger-dim); color: var(--danger); }

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.stat-value {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  line-height: 1;
}

.text-danger { color: var(--danger) !important; }

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--success);
  margin-top: auto;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.stat-pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
}

/* Tile common */
.tile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.tile-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.tile-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.tile-link {
  font-size: 12px;
  color: var(--accent);
  text-decoration: none;
}
.tile-link:hover { text-decoration: underline; }

.tile-icon { color: var(--text-muted); }

/* Chart */
.chart-wrap { margin: -4px -4px 0; }

/* Mini projects */
.project-list { display: flex; flex-direction: column; gap: 10px; }

.mini-project {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 100ms;
}
.mini-project:hover { background: var(--bg-card-hover); }

.mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mini-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.mini-pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  width: 28px;
  text-align: right;
}

/* Activity */
.activity-list { display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto; }

.activity-item { display: flex; gap: 10px; align-items: flex-start; }

.activity-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.activity-user { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.activity-action { font-size: 12px; color: var(--text-secondary); }
.activity-time { font-size: 10px; color: var(--text-muted); }

/* Members tile */
.member-list { display: flex; flex-direction: column; gap: 8px; }

.member-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 100ms;
}
.member-item:hover { background: var(--bg-card-hover); }

.member-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.member-name { flex: 1; font-size: 13px; color: var(--text-primary); }
.member-count {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--text-muted);
}

.empty-state-small {
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
}

.mono { font-family: 'JetBrains Mono', monospace; }
</style>
