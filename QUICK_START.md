# SmartWaterWatch - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
python3 --version  # Should be 3.10+
node --version     # Should be 18+
psql --version     # Should be PostgreSQL 15+
```

---

## Option 1: Automated Setup (Recommended)

### Linux/macOS
```bash
# Make script executable and run
chmod +x setup.sh
./setup.sh
```

### Windows (PowerShell)
```powershell
# Run setup script
.\setup.ps1
```

---

## Option 2: Manual Setup

### Step 1: Database Setup (2 minutes)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE smartwaterwatch;"

# Enable PostGIS
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Create schema
psql -U postgres -d smartwaterwatch -f database/schema.sql

# Seed initial data
psql -U postgres -d smartwaterwatch -f database/seeds/001_initial_data.sql
```

### Step 2: Backend Setup (3 minutes)

```bash
# Create virtual environment
cd backend
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Go back to root
cd ..
```

### Step 3: Frontend Setup (2 minutes)

```bash
# Install dependencies
npm install

# Update .env file
echo "VITE_API_BASE_URL=http://localhost:8000" >> .env
```

---

## 🎯 Running the Application

### Terminal 1: Start Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

**Backend is running at:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

### Terminal 2: Start Frontend
```bash
npm run dev
```

**Frontend is running at:** http://localhost:8080

---

## ✅ Verify Installation

### 1. Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Get water bodies
curl http://localhost:8000/api/v1/water-bodies/
```

### 2. Test Database
```bash
psql -U postgres -d smartwaterwatch -c "SELECT COUNT(*) FROM water_bodies;"
```

Expected output: 10 water bodies

### 3. Open Frontend
Visit http://localhost:8080 in your browser

---

## 📁 Project Structure

```
aqua-dash-explorer/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── core/              # Configuration
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── crud/              # Database operations
│   │   └── main.py            # FastAPI app
│   ├── venv/                  # Python virtual env
│   └── requirements.txt
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── services/api/      # API clients
│   │   ├── components/
│   │   ├── pages/
│   │   └── stores/
│   └── package.json
│
├── database/
│   ├── schema.sql             # Database schema
│   └── seeds/                 # Initial data
│
├── setup.sh                   # Linux/macOS setup
├── setup.ps1                  # Windows setup
└── README.md
```

---

## 🔧 Common Issues

### PostgreSQL Not Running
```bash
# Linux
sudo systemctl start postgresql

# macOS
brew services start postgresql

# Windows
net start postgresql-x64-15
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill process or use different port
uvicorn app.main:app --reload --port 8001
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Update DATABASE_URL in backend/.env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/smartwaterwatch
```

---

## 📚 Next Steps

1. **Read Documentation**
   - [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Detailed implementation guide
   - [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) - Full architecture plan
   - [CLAUDE.md](CLAUDE.md) - Project overview

2. **Explore API**
   - Open http://localhost:8000/docs
   - Try different endpoints
   - Check response schemas

3. **Modify Frontend**
   - Update `src/pages/Dashboard.tsx` to use real API
   - Remove hardcoded data imports
   - Test with live data

4. **Add Features**
   - Implement analysis endpoint
   - Add weather integration
   - Create ML models

---

## 🎓 Learning Resources

### FastAPI
- Documentation: https://fastapi.tiangolo.com/
- Tutorial: https://fastapi.tiangolo.com/tutorial/

### PostgreSQL + PostGIS
- PostGIS: https://postgis.net/documentation/
- SQLAlchemy: https://docs.sqlalchemy.org/

### React + Vite
- Vite: https://vitejs.dev/
- React Query: https://tanstack.com/query/latest

---

## 🐛 Getting Help

1. Check logs in terminal
2. Review API documentation at http://localhost:8000/docs
3. Verify database schema:
   ```bash
   psql -U postgres -d smartwaterwatch -c "\dt"
   ```

---

## 🎉 Success!

You should now have:
- ✅ PostgreSQL database with 10 water bodies
- ✅ FastAPI backend running on port 8000
- ✅ React frontend running on port 8080
- ✅ API documentation at /docs

**Next**: Follow [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for Phase 3+
