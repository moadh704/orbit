<template>
  <div class="auth-page">
    <!-- Left: Three.js particle canvas -->
    <div class="auth-visual">
      <canvas ref="canvasRef" class="particles-canvas" />
      <div class="visual-overlay">
        <div class="visual-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="4" fill="var(--accent)"/>
            <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="var(--accent)" stroke-width="1.5" fill="none" transform="rotate(-30 16 16)" opacity="0.8"/>
            <circle cx="16" cy="3" r="2" fill="var(--accent)" opacity="0.6"/>
          </svg>
          <span class="visual-logo-text">Orbit</span>
        </div>
        <div class="visual-steps">
          <p class="visual-steps-label section-label">Get started in 3 steps</p>
          <div v-for="(step, i) in steps" :key="i" class="visual-step">
            <div class="step-number">{{ i + 1 }}</div>
            <div>
              <p class="step-title">{{ step.title }}</p>
              <p class="step-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form -->
    <div class="auth-form-side">
      <div class="auth-form-container">
        <div class="auth-form-header">
          <h1>Create account</h1>
          <p>Start managing your team projects</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div v-if="error" class="auth-error">
            <AlertCircle :size="14" />
            {{ error }}
          </div>

          <div class="field">
            <label class="label">Full name</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="Alex Johnson"
              autocomplete="name"
              required
            />
          </div>

          <div class="field">
            <label class="label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              placeholder="you@company.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="field">
            <label class="label">Password</label>
            <div class="input-wrap">
              <input
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                class="input"
                placeholder="Minimum 6 characters"
                autocomplete="new-password"
                minlength="6"
                required
              />
              <button type="button" class="pw-toggle" @click="showPw = !showPw">
                <EyeOff v-if="showPw" :size="14" />
                <Eye v-else :size="14" />
              </button>
            </div>
            <div class="pw-strength">
              <div
                v-for="i in 4"
                :key="i"
                class="pw-bar"
                :class="{ active: passwordStrength >= i }"
                :style="{ background: strengthColor }"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
            <LoadingSpinner v-if="loading" :size="15" />
            <UserPlus v-else :size="15" />
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="auth-terms">
          By signing up you agree to our terms of service and privacy policy.
        </p>

        <p class="auth-switch">
          Already have an account?
          <RouterLink to="/login">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-vue-next'
import * as THREE from 'three'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const router = useRouter()
const canvasRef = ref(null)
const loading = ref(false)
const error = ref('')
const showPw = ref(false)

const form = reactive({ name: '', email: '', password: '' })

const steps = [
  { title: 'Create your account', desc: 'Get access to your workspace in seconds' },
  { title: 'Set up a project', desc: 'Organize tasks with kanban boards' },
  { title: 'Invite your team', desc: 'Collaborate in real-time' }
]

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[0-9!@#$%^&*]/.test(p)) s++
  return s
})

const strengthColor = computed(() => {
  const c = ['#EF4444', '#F59E0B', '#22C55E', '#22C55E']
  return c[passwordStrength.value - 1] || '#5A5E66'
})

async function handleRegister() {
  error.value = ''
  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  loading.value = true
  try {
    await authStore.register(form.name, form.email, form.password)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create account'
  } finally {
    loading.value = false
  }
}

// ── Three.js ─────────────────────────────────────────────────────────────
let renderer, scene, camera, animId

onMounted(() => initThree())
onUnmounted(() => {
  cancelAnimationFrame(animId)
  renderer?.dispose()
})

function initThree() {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = canvas.offsetWidth, h = canvas.offsetHeight

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
  camera.position.z = 6

  const COUNT = 80
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(COUNT * 3)
  const vels = []

  for (let i = 0; i < COUNT; i++) {
    pos[i*3] = (Math.random()-0.5)*12
    pos[i*3+1] = (Math.random()-0.5)*10
    pos[i*3+2] = (Math.random()-0.5)*4
    vels.push({ x: (Math.random()-0.5)*0.006, y: (Math.random()-0.5)*0.006 })
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  const mat = new THREE.PointsMaterial({ color: 0x7C5CFF, size: 0.05, transparent: true, opacity: 0.65 })
  const pts = new THREE.Points(geo, mat)
  scene.add(pts)

  const lineMat = new THREE.LineBasicMaterial({ color: 0x7C5CFF, transparent: true, opacity: 0.12 })

  let frame = 0
  function animate() {
    animId = requestAnimationFrame(animate)
    for (let i = 0; i < COUNT; i++) {
      pos[i*3] += vels[i].x
      pos[i*3+1] += vels[i].y
      if (Math.abs(pos[i*3]) > 6) vels[i].x *= -1
      if (Math.abs(pos[i*3+1]) > 5) vels[i].y *= -1
    }
    geo.attributes.position.needsUpdate = true

    if (frame % 4 === 0) {
      scene.children.forEach(c => { if (c.isLine) scene.remove(c) })
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1]
          if (Math.sqrt(dx*dx+dy*dy) < 3) {
            const lg = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(pos[i*3],pos[i*3+1],pos[i*3+2]),
              new THREE.Vector3(pos[j*3],pos[j*3+1],pos[j*3+2])
            ])
            scene.add(new THREE.Line(lg, lineMat))
          }
        }
      }
    }
    frame++
    pts.rotation.z += 0.0002
    renderer.render(scene, camera)
  }
  animate()

  const ro = new ResizeObserver(() => {
    const nw = canvas.offsetWidth, nh = canvas.offsetHeight
    renderer.setSize(nw, nh)
    camera.aspect = nw / nh
    camera.updateProjectionMatrix()
  })
  ro.observe(canvas)
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-app);
}

.auth-visual {
  position: relative;
  flex: 1;
  min-height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) { .auth-visual { display: none; } }

.particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  gap: 36px;
}

.visual-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.visual-logo-text {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.04em;
}

.visual-steps { display: flex; flex-direction: column; gap: 16px; }
.visual-steps-label { margin-bottom: 8px; }

.visual-step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-number {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
}

.step-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.step-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.auth-form-side {
  width: 440px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border);
  padding: 40px;
}

@media (max-width: 768px) { .auth-form-side { width: 100%; border-left: none; } }

.auth-form-container {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-form-header h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

.auth-form-header p { font-size: 14px; color: var(--text-muted); }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--danger-dim);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--danger);
}

.field { display: flex; flex-direction: column; gap: 6px; }

.input-wrap { position: relative; }
.input-wrap .input { padding-right: 38px; }

.pw-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.pw-strength {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.pw-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--border);
  transition: background 200ms;
}

.pw-bar.active { opacity: 1; }
.pw-bar:not(.active) { background: var(--border) !important; }

.auth-submit {
  width: 100%;
  height: 38px;
  justify-content: center;
  font-size: 14px;
  margin-top: 4px;
}

.auth-terms {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
}

.auth-switch {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.auth-switch a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}
</style>
