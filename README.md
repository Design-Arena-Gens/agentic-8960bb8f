# Job Marketplace MVP

A two-sided job marketplace similar to ZipRecruiter, connecting employers with job seekers.

## 🚀 Live Demo

- **Frontend:** https://agentic-8960bb8f.vercel.app
- **Backend API:** https://app-xbvnvylg.fly.dev

## 📋 Features

### Employer Portal
- Sign up and login with email/password authentication
- Post job listings with title, description, skills, location, and salary
- View all posted jobs in a dashboard
- View applications for each job with candidate details
- See applicant profiles including skills and experience

### Job Seeker Portal
- Sign up and login with email/password authentication
- Create and manage a professional profile
- Browse all available jobs
- Search and filter jobs by keywords and location
- View detailed job descriptions
- Apply to jobs with optional cover messages
- Track all submitted applications
- Get personalized job recommendations based on profile

### Smart Matching
- Skills-based matching algorithm
- Location preference matching
- Role preference matching
- Match score calculation for recommended jobs

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Authentication:** JWT tokens with bcrypt password hashing
- **Database:** In-memory storage (for MVP/proof of concept)
- **Deployment:** Fly.io

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Deployment:** Vercel

## 🏗️ Project Structure

```
agentic-8960bb8f/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          # FastAPI application with all endpoints
│   ├── pyproject.toml        # Python dependencies
│   └── poetry.lock
└── frontend/
    ├── src/
    │   ├── components/       # UI components (shadcn/ui)
    │   ├── contexts/         # React contexts (Auth)
    │   ├── lib/              # API client
    │   ├── pages/            # Page components
    │   └── App.tsx           # Main app with routing
    ├── package.json
    └── vite.config.ts
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Jobs (Employer)
- `POST /api/jobs` - Create a new job posting
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs
- `GET /api/jobs/{job_id}/applications` - Get applications for a job

### Jobs (Job Seeker)
- `GET /api/jobs` - List all jobs (with optional search/filter)
- `GET /api/jobs/{job_id}` - Get job details
- `GET /api/jobs/matched` - Get personalized job recommendations

### Applications
- `POST /api/applications` - Apply to a job
- `GET /api/applications/my-applications` - Get user's applications

### Profile
- `POST /api/profile` - Create profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Poetry (Python package manager)

### Backend Setup

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

The backend will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

## 📝 Important Notes

### In-Memory Database
This MVP uses in-memory storage for simplicity. Data will be lost when the backend restarts. For production use, integrate a persistent database like PostgreSQL or MongoDB.

### Authentication
- JWT tokens expire after 30 minutes
- Passwords are hashed using bcrypt
- Role-based access control (employer vs job seeker)

### Future Enhancements
- Persistent database integration
- Email notifications for applications
- Job board API integrations (Indeed, LinkedIn)
- Advanced search with filters
- Resume upload and parsing
- Messaging between employers and candidates
- Analytics dashboard
- Admin panel

## 👥 User Roles

### Employer
- Can post jobs
- Can view applications
- Cannot apply to jobs
- Cannot create job seeker profile

### Job Seeker
- Can create profile
- Can browse and search jobs
- Can apply to jobs
- Can view their applications
- Cannot post jobs

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes requiring authentication
- Role-based access control
- CORS enabled for frontend integration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🎨 UI/UX Features

- Clean, modern interface
- Intuitive navigation
- Real-time form validation
- Loading states
- Error handling with user-friendly messages
- Success notifications

## 📄 License

This project was created as an MVP demonstration.

## 🤝 Contributing

This is an MVP project. For production use, consider:
1. Adding persistent database
2. Implementing email verification
3. Adding file upload for resumes
4. Implementing real-time notifications
5. Adding comprehensive testing
6. Setting up CI/CD pipelines
7. Adding monitoring and logging

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Link to Devin run:** https://app.devin.ai/sessions/d5c67fa4990d40c2829e240a4ee5e49a

**Created by:** Design Arena Founders (@grxxce)
