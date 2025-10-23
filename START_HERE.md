# 🚀 START HERE - SmartWaterWatch Setup

## ⚡ Quick Decision: Choose Your PostgreSQL Setup

You have **3 options** for PostgreSQL setup. Choose the one that fits you best:

### Option 1: Docker PostgreSQL (⭐ RECOMMENDED - Easiest)

**Best for**: Everyone, especially if you don't want to configure PostgreSQL manually

```bash
# One command setup!
./setup_docker_postgres.sh

# Then continue with:
./setup_backend.sh
npm install
./test_installation.sh
```

**Pros**:
- ✅ Fastest setup
- ✅ No PostgreSQL configuration needed
- ✅ Isolated from your system
- ✅ Easy to reset/restart

**Cons**:
- ⚠️ Requires Docker installed

---

### Option 2: Local PostgreSQL with Manual Setup

**Best for**: If you already have PostgreSQL installed and want full control

```bash
# Follow the detailed guide
cat SETUP_POSTGRES.md

# After PostgreSQL is configured:
./setup_backend.sh
npm install
./test_installation.sh
```

**Pros**:
- ✅ Uses existing PostgreSQL
- ✅ More permanent setup
- ✅ Better for production

**Cons**:
- ⚠️ Requires manual PostgreSQL configuration
- ⚠️ May need sudo access

---

### Option 3: Supabase Cloud (Alternative)

**Best for**: If you want a cloud-hosted database

```bash
# 1. Create free Supabase project at https://supabase.com
# 2. Get your database URL from project settings
# 3. Update backend/.env with Supabase connection string
# 4. Run migration scripts through Supabase SQL editor
```

**Pros**:
- ✅ Cloud-hosted
- ✅ Built-in admin panel
- ✅ Free tier available

**Cons**:
- ⚠️ Requires internet
- ⚠️ Supabase account needed

---

## 🎯 Recommended Path for This Session

Since you're testing locally, I recommend **Option 1 (Docker)**:

### Step-by-Step:

1. **Check if Docker is installed**
   ```bash
   docker --version
   ```

   If not installed, get Docker:
   - **Linux**: `sudo apt install docker.io`
   - **macOS**: Download Docker Desktop
   - **Windows**: Download Docker Desktop

2. **Run the setup**
   ```bash
   ./setup_docker_postgres.sh
   ```

   This will:
   - ✅ Start PostgreSQL 15 + PostGIS in Docker
   - ✅ Create database
   - ✅ Apply schema (6 tables)
   - ✅ Seed data (10 water bodies, 900 measurements)
   - ✅ Configure backend/.env

3. **Setup backend**
   ```bash
   ./setup_backend.sh
   ```

   This will:
   - ✅ Create Python virtual environment
   - ✅ Install FastAPI and dependencies
   - ✅ Verify database connection

4. **Setup frontend**
   ```bash
   npm install
   ```

5. **Test everything**
   ```bash
   ./test_installation.sh
   ```

   This will verify:
   - ✅ Prerequisites
   - ✅ Database and tables
   - ✅ Backend setup
   - ✅ Frontend setup

6. **Start the application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:8080
   - API Docs: http://localhost:8000/docs
   - API Health: http://localhost:8000/health

---

## 🧪 Testing the API

Once backend is running, open http://localhost:8000/docs and try:

### 1. Get all water bodies
```
GET /api/v1/water-bodies/
```

Expected: List of 10 water bodies

### 2. Get water body by ID
```
GET /api/v1/water-bodies/{id}
```

Copy an ID from step 1 and try it

### 3. Get measurements
```
GET /api/v1/water-bodies/{id}/measurements
```

Expected: 90 days of measurement data

### 4. Get statistics
```
GET /api/v1/water-bodies/{id}/stats
```

Expected: Aggregated statistics and trends

---

## ⚠️ Troubleshooting

### Docker container won't start
```bash
# Check if port 5432 is already in use
sudo lsof -i :5432

# If yes, stop the conflicting service or use different port
docker run -p 5433:5432 ...
# Then update DATABASE_URL in backend/.env to use port 5433
```

### Backend can't connect to database
```bash
# Test database connection manually
PGPASSWORD=postgres psql -h localhost -U postgres -d smartwaterwatch -c "SELECT version();"

# If fails, check if container is running
docker ps | grep smartwater-postgres

# Restart container if needed
docker restart smartwater-postgres
```

### Permission denied on scripts
```bash
chmod +x *.sh
```

### Python module not found
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📋 Files Created

### Database
- ✅ `database/schema.sql` - Complete database schema
- ✅ `database/seeds/001_initial_data.sql` - Initial data

### Backend
- ✅ `backend/app/main.py` - FastAPI application
- ✅ `backend/app/models/` - SQLAlchemy models
- ✅ `backend/app/schemas/` - Pydantic schemas
- ✅ `backend/app/crud/` - Database operations
- ✅ `backend/app/api/v1/endpoints/` - API routes
- ✅ `backend/requirements.txt` - Python dependencies

### Frontend Integration
- ✅ `src/services/api/` - API client layer
- ✅ `src/hooks/useWaterBodiesApi.ts` - React Query hooks

### Setup Scripts
- ✅ `setup_docker_postgres.sh` - Docker PostgreSQL setup
- ✅ `setup_backend.sh` - Backend setup
- ✅ `test_installation.sh` - Test installation
- ✅ `setup.sh` - Original all-in-one setup
- ✅ `setup.ps1` - Windows PowerShell setup

### Documentation
- ✅ `SETUP_POSTGRES.md` - PostgreSQL setup guide
- ✅ `QUICK_START.md` - Quick start guide
- ✅ `IMPLEMENTATION_GUIDE.md` - Detailed implementation
- ✅ `IMPROVEMENT_PLAN.md` - Architecture plan
- ✅ `PROJECT_STATUS.md` - Project status
- ✅ `README_NEW.md` - Main README

---

## ✅ Next Steps After Setup

Once everything is running, you'll be ready for **Phase 2**:

1. **Test API endpoints** in Swagger UI
2. **Update Dashboard component** to use real API
3. **Add analysis endpoint** with weather integration
4. **Start ML model development**

---

## 🆘 Need Help?

1. Check `SETUP_POSTGRES.md` for PostgreSQL issues
2. Check `QUICK_START.md` for general setup
3. Run `./test_installation.sh` to diagnose problems
4. Check Docker logs: `docker logs smartwater-postgres`
5. Check backend logs in terminal where uvicorn is running

---

**Ready to start? Run this command:**

```bash
./setup_docker_postgres.sh && ./setup_backend.sh && npm install && ./test_installation.sh
```

This will set up everything automatically! 🚀
