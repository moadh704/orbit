<template>
  <div class="not-found">
    <div class="nf-content">
      <!-- Orbit graphic -->
      <div class="nf-graphic">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="8" fill="var(--accent)" opacity="0.9"/>
          <ellipse
            cx="60" cy="60" rx="48" ry="18"
            stroke="var(--accent)" stroke-width="1.5" fill="none"
            stroke-dasharray="6 4"
            transform="rotate(-30 60 60)"
            opacity="0.4"
          />
          <ellipse
            cx="60" cy="60" rx="48" ry="18"
            stroke="var(--accent)" stroke-width="1"
            fill="none"
            stroke-dasharray="4 6"
            transform="rotate(60 60 60)"
            opacity="0.2"
          />
          <circle cx="60" cy="12" r="5" fill="var(--accent)" opacity="0.6"/>
          <circle cx="105" cy="72" r="3" fill="var(--accent)" opacity="0.4"/>
          <circle cx="18" cy="52" r="2.5" fill="var(--accent)" opacity="0.3"/>
        </svg>
      </div>

      <div class="nf-code">404</div>
      <h1 class="nf-title">Lost in orbit</h1>
      <p class="nf-desc">
        This page drifted off into space. It might have been moved, deleted, or never existed.
      </p>

      <div class="nf-actions">
        <RouterLink to="/" class="btn btn-primary">
          <LayoutDashboard :size="14" />
          Back to dashboard
        </RouterLink>
        <RouterLink to="/projects" class="btn btn-secondary">
          <FolderOpen :size="14" />
          View projects
        </RouterLink>
      </div>

      <div class="nf-hint">
        <span class="mono">Error: </span>
        <span>PAGE_NOT_FOUND at {{ $route.path }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LayoutDashboard, FolderOpen } from 'lucide-vue-next'
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-app);
  padding: 40px;
}

.nf-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 440px;
}

.nf-graphic {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.nf-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 80px;
  font-weight: 800;
  color: var(--border-hover);
  line-height: 1;
  letter-spacing: -0.04em;
  margin: -8px 0;
}

.nf-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.nf-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 320px;
}

.nf-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.nf-hint {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
  margin-top: 8px;
}

.mono { font-family: 'JetBrains Mono', monospace; }
</style>
