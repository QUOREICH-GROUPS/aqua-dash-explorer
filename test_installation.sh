#!/bin/bash

# Test Installation Script

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}SmartWaterWatch - Installation Test${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

ERRORS=0

# Test 1: Prerequisites
echo -e "${YELLOW}Test 1: Checking prerequisites...${NC}"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✓ Python: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | cut -d' ' -f3)
    echo -e "${GREEN}✓ PostgreSQL: $PSQL_VERSION${NC}"
else
    echo -e "${RED}✗ PostgreSQL not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Database
echo ""
echo -e "${YELLOW}Test 2: Checking database...${NC}"

if [ -f "backend/.env" ]; then
    source backend/.env
    DB_EXISTS=$(echo "SELECT datname FROM pg_database WHERE datname='smartwaterwatch';" | psql $DATABASE_URL 2>/dev/null | grep -c "smartwaterwatch" || echo "0")

    if [ "$DB_EXISTS" = "1" ]; then
        echo -e "${GREEN}✓ Database 'smartwaterwatch' exists${NC}"

        # Check tables
        TABLE_COUNT=$(echo "\dt" | psql $DATABASE_URL -d smartwaterwatch 2>/dev/null | grep -c "table" || echo "0")
        if [ "$TABLE_COUNT" -ge "6" ]; then
            echo -e "${GREEN}✓ Database tables created ($TABLE_COUNT tables)${NC}"
        else
            echo -e "${RED}✗ Database tables missing${NC}"
            echo "  Run: psql -d smartwaterwatch -f database/schema.sql"
            ERRORS=$((ERRORS + 1))
        fi

        # Check data
        WATER_BODIES=$(echo "SELECT COUNT(*) FROM water_bodies;" | psql $DATABASE_URL -d smartwaterwatch 2>/dev/null | grep -E '^[0-9]+$' | head -1 || echo "0")
        if [ "$WATER_BODIES" -gt "0" ]; then
            echo -e "${GREEN}✓ Database seeded ($WATER_BODIES water bodies)${NC}"
        else
            echo -e "${RED}✗ Database not seeded${NC}"
            echo "  Run: psql -d smartwaterwatch -f database/seeds/001_initial_data.sql"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${RED}✗ Database 'smartwaterwatch' not found${NC}"
        echo "  See SETUP_POSTGRES.md for instructions"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ backend/.env not found${NC}"
    echo "  See SETUP_POSTGRES.md for instructions"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Backend
echo ""
echo -e "${YELLOW}Test 3: Checking backend...${NC}"

if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✓ Python virtual environment exists${NC}"

    if [ -f "backend/venv/bin/activate" ]; then
        source backend/venv/bin/activate

        # Check if FastAPI is installed
        if python -c "import fastapi" 2>/dev/null; then
            echo -e "${GREEN}✓ FastAPI installed${NC}"
        else
            echo -e "${RED}✗ FastAPI not installed${NC}"
            echo "  Run: pip install -r backend/requirements.txt"
            ERRORS=$((ERRORS + 1))
        fi

        # Check if SQLAlchemy is installed
        if python -c "import sqlalchemy" 2>/dev/null; then
            echo -e "${GREEN}✓ SQLAlchemy installed${NC}"
        else
            echo -e "${RED}✗ SQLAlchemy not installed${NC}"
            ERRORS=$((ERRORS + 1))
        fi

        deactivate
    fi
else
    echo -e "${RED}✗ Python virtual environment not found${NC}"
    echo "  Run: ./setup_backend.sh"
    ERRORS=$((ERRORS + 1))
fi

# Test 4: Frontend
echo ""
echo -e "${YELLOW}Test 4: Checking frontend...${NC}"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Node modules installed${NC}"
else
    echo -e "${RED}✗ Node modules not installed${NC}"
    echo "  Run: npm install"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".env" ]; then
    if grep -q "VITE_API_BASE_URL" .env; then
        echo -e "${GREEN}✓ Frontend .env configured${NC}"
    else
        echo -e "${RED}✗ VITE_API_BASE_URL not set in .env${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠ Frontend .env not found (will use defaults)${NC}"
fi

# Summary
echo ""
echo -e "${YELLOW}==================================================${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}==================================================${NC}"
    echo ""
    echo "Ready to start the application:"
    echo ""
    echo "1. Start backend (Terminal 1):"
    echo -e "   ${YELLOW}cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000${NC}"
    echo ""
    echo "2. Start frontend (Terminal 2):"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "3. Access:"
    echo "   - Frontend: http://localhost:8080"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
else
    echo -e "${RED}✗ $ERRORS test(s) failed${NC}"
    echo -e "${RED}==================================================${NC}"
    echo ""
    echo "Please fix the errors above before starting the application."
    echo "See documentation files for help:"
    echo "  - SETUP_POSTGRES.md"
    echo "  - QUICK_START.md"
    echo "  - IMPLEMENTATION_GUIDE.md"
    echo ""
fi
