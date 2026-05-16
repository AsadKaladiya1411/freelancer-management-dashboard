# ⚡ FreelanceFlow — Freelancer Management System

A modern, full-stack SaaS platform for freelancers to manage clients, projects, and payments — built with the MERN stack.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)

---

## 🎯 Overview

FreelanceFlow is a production-ready freelancer management platform that helps you:

- **Track Clients** — Maintain a professional client directory with contact details and company info
- **Manage Projects** — Create, track, and organize projects with status, budgets, and deadlines
- **Record Payments** — Log payments, track earnings, and export financial data
- **Analyze Performance** — Visual dashboard with revenue charts, project status, and business insights

---

## ✨ Features

### Core Functionality
- 📊 **Analytics Dashboard** — Revenue charts, project status breakdown, overdue alerts
- 👥 **Client Management** — Full CRUD with search and filtering
- 📁 **Project Tracking** — Status tracking (Pending → In Progress → Completed), budget & deadlines
- 💰 **Payment Recording** — Payment method tracking, auto-calculated totals, CSV export
- ⚙️ **Settings** — Profile management, password change, theme preferences

### Technical Features
- 🔐 **JWT Authentication** — Access + refresh token rotation with httpOnly cookies
- 🌙 **Dark/Light Mode** — Persistent theme toggle with full dark mode support
- 📱 **Responsive Design** — Mobile-first layout with collapsible sidebar and hamburger menu
- 🔔 **Toast Notifications** — Real-time feedback for all operations
- 🛡️ **Protected Routes** — Automatic redirect for unauthenticated users
- 🔄 **Auto Token Refresh** — Seamless background token renewal with request queuing
- 📦 **CSV Export** — Download payment data for accounting

### UI/UX
- Glassmorphism design with backdrop blur effects
- Gradient stat cards with decorative elements
- Shimmer loading skeletons
- Smooth page transitions and micro-animations
- Custom design system with Inter typography
- Styled confirm dialogs and modals

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3 |
| **Backend** | Node.js, Express 4, Socket.IO |
| **Database** | MongoDB Atlas (Mongoose 8) |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Charts** | Chart.js + react-chartjs-2 |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |
| **Security** | Helmet, CORS, Rate Limiting, Mongo Sanitize |
| **Deployment** | Vercel (frontend) / Render (backend) |

---

## 📁 Project Structure

```
freelanceflow/
├── client/                        # Frontend (Vite + React + Tailwind)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Centralized API client with JWT
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx # Auth guard
│   │   │   └── ui/
│   │   │       ├── Modal.jsx
│   │   │       ├── StatCard.jsx
│   │   │       ├── LoadingSkeleton.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       └── ConfirmDialog.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── ThemeContext.jsx   # Dark/light mode
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + design system
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                        # Backend (Express + MongoDB)
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── projectController.js
│   │   ├── paymentController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Project.js
│   │   ├── Payment.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── generateTokens.js
│   ├── validators/
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── package.json                   # Root scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org)
- **MongoDB Atlas** account — [Sign up free](https://cloud.mongodb.com)
- **Git** — [Download](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/freelanceflow.git
cd freelanceflow
```

### 2. Setup environment variables

Create `server/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### 5. Open in browser

Navigate to **http://localhost:5173**

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Logout user |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |
| `PUT` | `/api/auth/change-password` | Change password |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/clients` | List clients (with search, pagination) |
| `POST` | `/api/clients` | Create client |
| `GET` | `/api/clients/:id` | Get single client |
| `PUT` | `/api/clients/:id` | Update client |
| `DELETE` | `/api/clients/:id` | Delete client (cascade) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List projects (with filters) |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get single project |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project (cascade) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments` | List payments (with date range filter) |
| `POST` | `/api/payments` | Record payment |
| `GET` | `/api/payments/:id` | Get single payment |
| `PUT` | `/api/payments/:id` | Update payment |
| `DELETE` | `/api/payments/:id` | Delete payment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get dashboard analytics |
| `GET` | `/api/health` | Health check |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `client`
4. Set environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
5. Deploy

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables from `server/.env`

### Full-Stack on Render

The server can serve the built frontend in production:

```bash
cd client && npm run build
```

Set `NODE_ENV=production` in server env and the Express server will serve the Vite build automatically.

---

## 🔒 Security Features

- **Password hashing** — bcrypt with 12 salt rounds
- **JWT token rotation** — Refresh tokens rotated on each use
- **Rate limiting** — API and auth-specific rate limits
- **Input sanitization** — express-mongo-sanitize prevents NoSQL injection
- **Helmet** — HTTP security headers
- **CORS** — Configurable origin whitelist
- **httpOnly cookies** — Refresh tokens stored securely

---

## 📋 Scripts

### Root
| Script | Command | Description |
|--------|---------|-------------|
| `dev:server` | `cd server && npm run dev` | Start backend with nodemon |
| `dev:client` | `cd client && npm run dev` | Start Vite dev server |
| `build` | `cd client && npm run build` | Build frontend for production |

### Server
| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node server.js` | Start production server |
| `dev` | `nodemon server.js` | Start with hot reload |
| `seed` | `node utils/seed.js` | Seed sample data |

### Client
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server (port 5173) |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <strong>Asad</strong>
</p>
