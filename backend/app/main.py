from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import bcrypt
import uuid

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

users_db = {}
jobs_db = {}
applications_db = {}
profiles_db = {}

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    user_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class JobCreate(BaseModel):
    title: str
    description: str
    skills: List[str]
    location: str
    salary: Optional[str] = None
    company: str

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    salary: Optional[str] = None

class ProfileCreate(BaseModel):
    name: str
    skills: List[str]
    experience: str
    preferred_role: str
    preferred_location: str

class ApplicationCreate(BaseModel):
    job_id: str
    message: Optional[str] = None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/signup")
async def signup(user: UserSignup):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "password": hashed_password,
        "name": user.name,
        "user_type": user.user_type,
        "created_at": datetime.utcnow().isoformat()
    }
    
    access_token = create_access_token(data={"sub": user_id, "email": user.email, "user_type": user.user_type})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "user_type": user.user_type
        }
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    stored_user = users_db[user.email]
    if not bcrypt.checkpw(user.password.encode('utf-8'), stored_user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={
        "sub": stored_user["id"],
        "email": stored_user["email"],
        "user_type": stored_user["user_type"]
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": stored_user["id"],
            "email": stored_user["email"],
            "name": stored_user["name"],
            "user_type": stored_user["user_type"]
        }
    }

@app.get("/api/auth/me")
async def get_current_user(user_id: str = Depends(verify_token)):
    for email, user in users_db.items():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "user_type": user["user_type"]
            }
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/api/jobs")
async def create_job(job: JobCreate, user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "employer":
        raise HTTPException(status_code=403, detail="Only employers can post jobs")
    
    job_id = str(uuid.uuid4())
    jobs_db[job_id] = {
        "id": job_id,
        "employer_id": user_id,
        "employer_name": user["name"],
        "title": job.title,
        "description": job.description,
        "skills": job.skills,
        "location": job.location,
        "salary": job.salary,
        "company": job.company,
        "created_at": datetime.utcnow().isoformat(),
        "status": "active"
    }
    
    return jobs_db[job_id]

@app.get("/api/jobs")
async def get_jobs(search: Optional[str] = None, location: Optional[str] = None):
    jobs = list(jobs_db.values())
    
    if search:
        search_lower = search.lower()
        jobs = [j for j in jobs if 
                search_lower in j["title"].lower() or 
                search_lower in j["description"].lower() or
                any(search_lower in skill.lower() for skill in j["skills"])]
    
    if location:
        location_lower = location.lower()
        jobs = [j for j in jobs if location_lower in j["location"].lower()]
    
    return jobs

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs_db[job_id]

@app.get("/api/jobs/employer/my-jobs")
async def get_employer_jobs(user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "employer":
        raise HTTPException(status_code=403, detail="Only employers can access this")
    
    employer_jobs = [job for job in jobs_db.values() if job["employer_id"] == user_id]
    return employer_jobs

@app.get("/api/jobs/{job_id}/applications")
async def get_job_applications(job_id: str, user_id: str = Depends(verify_token)):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    if job["employer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    job_applications = [app for app in applications_db.values() if app["job_id"] == job_id]
    
    for app in job_applications:
        if app["seeker_id"] in profiles_db:
            app["seeker_profile"] = profiles_db[app["seeker_id"]]
    
    return job_applications

@app.post("/api/applications")
async def create_application(application: ApplicationCreate, user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can apply")
    
    if application.job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for app in applications_db.values():
        if app["job_id"] == application.job_id and app["seeker_id"] == user_id:
            raise HTTPException(status_code=400, detail="Already applied to this job")
    
    app_id = str(uuid.uuid4())
    applications_db[app_id] = {
        "id": app_id,
        "job_id": application.job_id,
        "seeker_id": user_id,
        "seeker_name": user["name"],
        "seeker_email": user["email"],
        "message": application.message,
        "created_at": datetime.utcnow().isoformat(),
        "status": "pending"
    }
    
    return applications_db[app_id]

@app.get("/api/applications/my-applications")
async def get_my_applications(user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can access this")
    
    my_applications = [app for app in applications_db.values() if app["seeker_id"] == user_id]
    
    for app in my_applications:
        if app["job_id"] in jobs_db:
            app["job"] = jobs_db[app["job_id"]]
    
    return my_applications

@app.post("/api/profile")
async def create_profile(profile: ProfileCreate, user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can create profiles")
    
    profiles_db[user_id] = {
        "user_id": user_id,
        "name": profile.name,
        "skills": profile.skills,
        "experience": profile.experience,
        "preferred_role": profile.preferred_role,
        "preferred_location": profile.preferred_location,
        "created_at": datetime.utcnow().isoformat()
    }
    
    return profiles_db[user_id]

@app.get("/api/profile")
async def get_profile(user_id: str = Depends(verify_token)):
    if user_id not in profiles_db:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profiles_db[user_id]

@app.put("/api/profile")
async def update_profile(profile: ProfileCreate, user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can update profiles")
    
    profiles_db[user_id] = {
        "user_id": user_id,
        "name": profile.name,
        "skills": profile.skills,
        "experience": profile.experience,
        "preferred_role": profile.preferred_role,
        "preferred_location": profile.preferred_location,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    return profiles_db[user_id]

@app.get("/api/jobs/matched")
async def get_matched_jobs(user_id: str = Depends(verify_token)):
    user = None
    for email, u in users_db.items():
        if u["id"] == user_id:
            user = u
            break
    
    if not user or user["user_type"] != "seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can access this")
    
    if user_id not in profiles_db:
        return []
    
    profile = profiles_db[user_id]
    matched_jobs = []
    
    for job in jobs_db.values():
        match_score = 0
        
        for skill in profile["skills"]:
            if any(skill.lower() in job_skill.lower() for job_skill in job["skills"]):
                match_score += 1
        
        if profile["preferred_location"].lower() in job["location"].lower():
            match_score += 1
        
        if profile["preferred_role"].lower() in job["title"].lower():
            match_score += 2
        
        if match_score > 0:
            job_copy = job.copy()
            job_copy["match_score"] = match_score
            matched_jobs.append(job_copy)
    
    matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    
    return matched_jobs
