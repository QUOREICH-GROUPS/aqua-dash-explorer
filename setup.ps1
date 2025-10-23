# SmartWaterWatch - Local Setup Script (Windows PowerShell)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SmartWaterWatch - Local Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
try {
    $psqlVersion = psql --version
    Write-Host "✓ PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not installed. Please install PostgreSQL 15+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Database Setup" -ForegroundColor Yellow

# Create database
Write-Host "Creating database 'smartwaterwatch'..."
psql -U postgres -c "DROP DATABASE IF EXISTS smartwaterwatch;" 2>$null
psql -U postgres -c "CREATE DATABASE smartwaterwatch;"
Write-Host "✓ Database created" -ForegroundColor Green

# Enable PostGIS
Write-Host "Enabling PostGIS extension..."
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS \`"uuid-ossp\`";"
Write-Host "✓ PostGIS enabled" -ForegroundColor Green

# Create schema
if (Test-Path "database/schema.sql") {
    Write-Host "Creating database schema..."
    psql -U postgres -d smartwaterwatch -f database/schema.sql
    Write-Host "✓ Schema created" -ForegroundColor Green
} else {
    Write-Host "⚠ database/schema.sql not found. Skipping schema creation." -ForegroundColor Yellow
}

# Seed data
if (Test-Path "database/seeds/001_initial_data.sql") {
    Write-Host "Seeding initial data..."
    psql -U postgres -d smartwaterwatch -f database/seeds/001_initial_data.sql
    Write-Host "✓ Data seeded" -ForegroundColor Green
} else {
    Write-Host "⚠ database/seeds/001_initial_data.sql not found. Skipping data seeding." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Backend Setup" -ForegroundColor Yellow

# Create backend directory structure
New-Item -ItemType Directory -Force -Path backend/app/api/v1/endpoints | Out-Null
New-Item -ItemType Directory -Force -Path backend/app/core | Out-Null
New-Item -ItemType Directory -Force -Path backend/app/models | Out-Null
New-Item -ItemType Directory -Force -Path backend/app/schemas | Out-Null
New-Item -ItemType Directory -Force -Path backend/app/crud | Out-Null
New-Item -ItemType Directory -Force -Path backend/app/services | Out-Null

# Create Python virtual environment
if (-not (Test-Path "backend/venv")) {
    Write-Host "Creating Python virtual environment..."
    Set-Location backend
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    Write-Host "✓ Virtual environment created" -ForegroundColor Green

    # Install dependencies
    if (Test-Path "requirements.txt") {
        Write-Host "Installing Python dependencies..."
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        Write-Host "✓ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ requirements.txt not found. Skipping dependency installation." -ForegroundColor Yellow
    }

    Set-Location ..
} else {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
}

# Create .env file if it doesn't exist
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating backend/.env file..."
    @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartwaterwatch
"@ | Out-File -FilePath "backend/.env" -Encoding UTF8
    Write-Host "✓ backend/.env created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Frontend Setup" -ForegroundColor Yellow

# Install frontend dependencies
if (Test-Path "package.json") {
    Write-Host "Installing frontend dependencies..."
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ package.json not found. Skipping frontend setup." -ForegroundColor Yellow
}

# Update frontend .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    @"
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_PROJECT_ID=srsmdererxbkfuyocjrg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc21kZXJlcnhia2Z1eW9janJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0OTY0NTgsImV4cCI6MjA3NjA3MjQ1OH0.FPIK4JMdUF26NfPY-lnWZ3gfEIH1JdnTGC4y4Vp0AFM
VITE_SUPABASE_URL=https://srsmdererxbkfuyocjrg.supabase.co
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env created" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:"
Write-Host ""
Write-Host "1. Start the backend:" -ForegroundColor Cyan
Write-Host "   cd backend"
Write-Host "   .\venv\Scripts\Activate.ps1"
Write-Host "   uvicorn app.main:app --reload --port 8000"
Write-Host ""
Write-Host "2. In a new terminal, start the frontend:" -ForegroundColor Cyan
Write-Host "   npm run dev"
Write-Host ""
Write-Host "Then open http://localhost:8080 in your browser"
Write-Host ""
Write-Host "API Documentation: http://localhost:8000/docs"
Write-Host ""
