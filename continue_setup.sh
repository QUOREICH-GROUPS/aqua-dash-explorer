#!/bin/bash

# Continue Setup After PostGIS Installation

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}SmartWaterWatch - Continue Setup${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

# Step 1: Create PostGIS extension
echo -e "${YELLOW}Step 1: Creating PostGIS extension...${NC}"
sudo -u postgres psql -d smartwaterwatch -c "CREATE EXTENSION IF NOT EXISTS postgis;"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostGIS extension created${NC}"
else
    echo -e "${RED}✗ Failed to create PostGIS extension${NC}"
    echo "Make sure you ran: sudo apt install postgresql-15-postgis-3"
    exit 1
fi

# Verify PostGIS
POSTGIS_VERSION=$(sudo -u postgres psql -d smartwaterwatch -t -c "SELECT PostGIS_Version();" | head -1)
echo -e "${GREEN}✓ PostGIS version: $POSTGIS_VERSION${NC}"

# Step 2: Apply database schema
echo ""
echo -e "${YELLOW}Step 2: Applying database schema...${NC}"
PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -f database/schema.sql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema applied successfully${NC}"
else
    echo -e "${RED}✗ Failed to apply schema${NC}"
    exit 1
fi

# Step 3: Seed initial data
echo ""
echo -e "${YELLOW}Step 3: Seeding initial data...${NC}"
PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -f database/seeds/001_initial_data.sql > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data seeded successfully${NC}"
else
    echo -e "${RED}✗ Failed to seed data${NC}"
    exit 1
fi

# Verify data
WATER_BODIES=$(PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -t -c "SELECT COUNT(*) FROM water_bodies;" | xargs)
MEASUREMENTS=$(PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -t -c "SELECT COUNT(*) FROM water_measurements;" | xargs)
echo -e "${GREEN}✓ Created: $WATER_BODIES water bodies, $MEASUREMENTS measurements${NC}"

# Step 4: Create backend/.env
echo ""
echo -e "${YELLOW}Step 4: Creating backend configuration...${NC}"
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://suprox:smartwater2025@localhost:5432/smartwaterwatch
DEBUG=True
PROJECT_NAME=SmartWaterWatch API
VERSION=1.0.0
BACKEND_CORS_ORIGINS=["http://localhost:8080","http://localhost:5173"]
EOF
echo -e "${GREEN}✓ backend/.env created${NC}"

# Step 5: Setup Python virtual environment
echo ""
echo -e "${YELLOW}Step 5: Setting up Python backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate

echo "Installing Python dependencies (this may take a minute)..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

deactivate
cd ..

# Step 6: Setup frontend
echo ""
echo -e "${YELLOW}Step 6: Setting up frontend...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies (this may take a minute)..."
    npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Node dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install Node dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Node dependencies already installed${NC}"
fi

# Create/update frontend .env
if ! grep -q "VITE_API_BASE_URL" .env 2>/dev/null; then
    echo "VITE_API_BASE_URL=http://localhost:8000" >> .env
    echo -e "${GREEN}✓ Frontend .env updated${NC}"
fi

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo "Database Information:"
echo "  - Database: smartwaterwatch"
echo "  - Water Bodies: $WATER_BODIES"
echo "  - Measurements: $MEASUREMENTS"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo -e "  ${YELLOW}cd backend${NC}"
echo -e "  ${YELLOW}source venv/bin/activate${NC}"
echo -e "  ${YELLOW}uvicorn app.main:app --reload --port 8000${NC}"
echo ""
echo "Terminal 2 - Frontend:"
echo -e "  ${YELLOW}npm run dev${NC}"
echo ""
echo "Then access:"
echo "  - Frontend: http://localhost:8080"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "Run './test_installation.sh' to verify everything!"
echo ""
