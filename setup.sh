#!/bin/bash

# SmartWaterWatch - Local Setup Script (Linux/macOS)

set -e  # Exit on error

echo "================================================"
echo "SmartWaterWatch - Local Setup"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.10+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Please install PostgreSQL 15+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found: $(psql --version)${NC}"

echo ""
echo -e "${YELLOW}Step 1: Database Setup${NC}"

# Create database
echo "Creating database 'smartwaterwatch'..."
psql -U postgres -c "DROP DATABASE IF EXISTS smartwaterwatch;" 2>/dev/null || true
psql -U postgres -c "CREATE DATABASE smartwaterwatch;"
echo -e "${GREEN}✓ Database created${NC}"

# Enable PostGIS
echo "Enabling PostGIS extension..."
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
echo -e "${GREEN}✓ PostGIS enabled${NC}"

# Create schema
if [ -f "database/schema.sql" ]; then
    echo "Creating database schema..."
    psql -U postgres -d smartwaterwatch -f database/schema.sql
    echo -e "${GREEN}✓ Schema created${NC}"
else
    echo -e "${YELLOW}⚠ database/schema.sql not found. Skipping schema creation.${NC}"
fi

# Seed data
if [ -f "database/seeds/001_initial_data.sql" ]; then
    echo "Seeding initial data..."
    psql -U postgres -d smartwaterwatch -f database/seeds/001_initial_data.sql
    echo -e "${GREEN}✓ Data seeded${NC}"
else
    echo -e "${YELLOW}⚠ database/seeds/001_initial_data.sql not found. Skipping data seeding.${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Backend Setup${NC}"

# Create backend directory structure
mkdir -p backend/app/{api/v1/endpoints,core,models,schemas,crud,services}

# Create Python virtual environment
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment created${NC}"

    # Install dependencies
    if [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies..."
        pip install --upgrade pip
        pip install -r requirements.txt
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠ requirements.txt not found. Skipping dependency installation.${NC}"
    fi

    cd ..
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartwaterwatch
EOF
    echo -e "${GREEN}✓ backend/.env created${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Frontend Setup${NC}"

# Install frontend dependencies
if [ -f "package.json" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ package.json not found. Skipping frontend setup.${NC}"
fi

# Update frontend .env
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_PROJECT_ID=srsmdererxbkfuyocjrg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyc21kZXJlcnhia2Z1eW9janJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0OTY0NTgsImV4cCI6MjA3NjA3MjQ1OH0.FPIK4JMdUF26NfPY-lnWZ3gfEIH1JdnTGC4y4Vp0AFM
VITE_SUPABASE_URL=https://srsmdererxbkfuyocjrg.supabase.co
EOF
    echo -e "${GREEN}✓ .env created${NC}"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo -e "   ${YELLOW}cd backend${NC}"
echo -e "   ${YELLOW}source venv/bin/activate${NC}"
echo -e "   ${YELLOW}uvicorn app.main:app --reload --port 8000${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "Then open http://localhost:8080 in your browser"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo ""
