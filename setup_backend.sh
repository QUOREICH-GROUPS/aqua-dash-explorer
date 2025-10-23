#!/bin/bash

# Backend Setup Script (After PostgreSQL is configured)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}SmartWaterWatch - Backend Setup${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

# Check if database is accessible
echo -e "${YELLOW}Step 1: Verifying database connection...${NC}"
if [ -f "backend/.env" ]; then
    source backend/.env
    echo "Using DATABASE_URL from backend/.env"
else
    echo -e "${RED}Error: backend/.env not found${NC}"
    echo "Please run PostgreSQL setup first (see SETUP_POSTGRES.md)"
    exit 1
fi

# Test database connection
echo "Testing database connection..."
DB_TEST=$(echo "SELECT version();" | psql $DATABASE_URL 2>&1 | grep -c "PostgreSQL" || echo "0")
if [ "$DB_TEST" = "0" ]; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Please check your DATABASE_URL in backend/.env"
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"

# Create virtual environment
echo ""
echo -e "${YELLOW}Step 2: Creating Python virtual environment...${NC}"
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo ""
echo -e "${YELLOW}Step 3: Installing Python dependencies...${NC}"
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ Dependencies installed${NC}"

cd ..

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}Backend Setup Complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo "To start the backend server:"
echo -e "${YELLOW}cd backend${NC}"
echo -e "${YELLOW}source venv/bin/activate${NC}"
echo -e "${YELLOW}uvicorn app.main:app --reload --port 8000${NC}"
echo ""
