const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'light-demo-jwt-secret-orbit';

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const memberRoutes = require('./routes/memberRoutes');
const { protect } = require('./middleware/authMiddleware');
const { acceptInvite } = require('./controllers/memberController');
const { ensure } = require('./db/migrate');

const app = express();
const httpServer = createServer(app);

const clientDist = path.join(__dirname, '..', 'client', 'dist');
const serveSpa = process.env.SERVE_SPA !== 'false' && fs.existsSync(clientDist);

// When SPA is served from the same origin, allow that host + CLIENT_URL + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Render preview / custom domains
  if (origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) return true;
  return false;
}

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('trust proxy', 1);

// CSP disabled so the Vue SPA (inline styles / CDN fonts) can load cleanly
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later',
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many login attempts, please try again later',
});
app.use('/api/auth', authLimiter);

// Health check for Render
app.use(async (req, res, next) => {
  try {
    await ensure();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, spa: serveSpa });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/members', memberRoutes);
// Email links are /invite/:token and do not include a project id.
// acceptInvite looks the token up, so this route does not need one.
app.post('/api/invites/:token/accept', protect, acceptInvite);

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// Production: serve Vue build from same origin (works with free single Render service)
if (serveSpa) {
  app.use(express.static(clientDist, { index: false }));
  app.get(/^(?!\/api)(?!\/socket\.io).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('Serving SPA from', clientDist);
}

const PORT = process.env.PORT || 8080;

if (!process.env.VERCEL) {
  ensure()
    .catch((err) => console.error('DB migrate failed (will still start):', err.message))
    .finally(() => {
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} (SPA: ${serveSpa})`);
      });
    });
}

module.exports = app;
