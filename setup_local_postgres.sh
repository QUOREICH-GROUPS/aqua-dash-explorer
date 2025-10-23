#!/bin/bash

# Local PostgreSQL Setup (No Docker)
# This script will guide you through PostgreSQL setup

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}SmartWaterWatch - Local PostgreSQL Setup${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

echo "This script will create SQL commands for you to run."
echo "You'll need sudo access to configure PostgreSQL."
echo ""

# Create SQL file
cat > /tmp/setup_smartwater.sql << 'EOF'
-- Create database
CREATE DATABASE smartwaterwatch;

-- Create user (change password as needed)
CREATE USER suprox WITH PASSWORD 'smartwater2025';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE smartwaterwatch TO suprox;

-- Connect to database
\c smartwaterwatch

-- Create extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO suprox;

-- Verify
SELECT version();
SELECT PostGIS_Version();
EOF

echo -e "${YELLOW}Step 1: Run SQL commands as postgres user${NC}"
echo ""
echo "Run this command:"
echo -e "${GREEN}sudo -u postgres psql -f /tmp/setup_smartwater.sql${NC}"
echo ""
read -p "Press ENTER after you've run the command above..."

# Test connection
echo ""
echo -e "${YELLOW}Step 2: Testing database connection...${NC}"
PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -c "SELECT 'Connection successful!' as status;" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed. You may need to update pg_hba.conf${NC}"
    echo ""
    echo "Run these commands:"
    echo -e "${GREEN}sudo nano /etc/postgresql/15/main/pg_hba.conf${NC}"
    echo ""
    echo "Find this line:"
    echo "  local   all             all                                     peer"
    echo ""
    echo "Change it to:"
    echo "  local   all             all                                     md5"
    echo ""
    echo "Save and run:"
    echo -e "${GREEN}sudo systemctl restart postgresql${NC}"
    echo ""
    read -p "Press ENTER after fixing authentication..."
fi

# Apply schema
echo ""
echo -e "${YELLOW}Step 3: Applying database schema...${NC}"
PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -f database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema applied${NC}"
else
    echo -e "${RED}✗ Failed to apply schema${NC}"
    exit 1
fi

# Seed data
echo ""
echo -e "${YELLOW}Step 4: Seeding initial data...${NC}"
PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -f database/seeds/001_initial_data.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data seeded${NC}"
else
    echo -e "${RED}✗ Failed to seed data${NC}"
    exit 1
fi

# Create backend/.env
echo ""
echo -e "${YELLOW}Step 5: Creating backend/.env...${NC}"
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://suprox:smartwater2025@localhost:5432/smartwaterwatch
DEBUG=True
PROJECT_NAME=SmartWaterWatch API
VERSION=1.0.0
EOF
echo -e "${GREEN}✓ backend/.env created${NC}"

# Verify
echo ""
echo -e "${YELLOW}Step 6: Verifying installation...${NC}"
WATER_BODIES=$(PGPASSWORD='smartwater2025' psql -U suprox -d smartwaterwatch -t -c "SELECT COUNT(*) FROM water_bodies;")
echo -e "${GREEN}✓ Database has $WATER_BODIES water bodies${NC}"

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}Local PostgreSQL Setup Complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo "Database credentials:"
echo "  - Database: smartwaterwatch"
echo "  - User: suprox"
echo "  - Password: smartwater2025"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo ""
echo "Next steps:"
echo "  1. Run: ./setup_backend.sh"
echo "  2. Run: npm install"
echo "  3. Run: ./test_installation.sh"
echo ""
