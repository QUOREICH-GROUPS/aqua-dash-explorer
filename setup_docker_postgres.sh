#!/bin/bash

# Setup PostgreSQL using Docker (Easiest option)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}SmartWaterWatch - Docker PostgreSQL Setup${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^smartwater-postgres$"; then
    echo -e "${YELLOW}Container 'smartwater-postgres' already exists${NC}"
    echo "Stopping and removing existing container..."
    docker stop smartwater-postgres 2>/dev/null || true
    docker rm smartwater-postgres 2>/dev/null || true
fi

# Run PostgreSQL with PostGIS in Docker
echo ""
echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
docker run --name smartwater-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smartwaterwatch \
  -p 5432:5432 \
  -d postgis/postgis:15-3.3

echo -e "${GREEN}✓ Container started${NC}"

# Wait for PostgreSQL to be ready
echo ""
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec smartwater-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: PostgreSQL did not start in time${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Create extensions
echo ""
echo -e "${YELLOW}Creating PostGIS extension...${NC}"
docker exec smartwater-postgres psql -U postgres -d smartwaterwatch \
  -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker exec smartwater-postgres psql -U postgres -d smartwaterwatch \
  -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
echo -e "${GREEN}✓ Extensions created${NC}"

# Apply schema
echo ""
echo -e "${YELLOW}Applying database schema...${NC}"
docker exec -i smartwater-postgres psql -U postgres -d smartwaterwatch < database/schema.sql
echo -e "${GREEN}✓ Schema applied${NC}"

# Seed data
echo ""
echo -e "${YELLOW}Seeding initial data...${NC}"
docker exec -i smartwater-postgres psql -U postgres -d smartwaterwatch < database/seeds/001_initial_data.sql
echo -e "${GREEN}✓ Data seeded${NC}"

# Create backend/.env
echo ""
echo -e "${YELLOW}Creating backend/.env...${NC}"
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartwaterwatch
DEBUG=True
PROJECT_NAME=SmartWaterWatch API
VERSION=1.0.0
EOF
echo -e "${GREEN}✓ backend/.env created${NC}"

# Verify installation
echo ""
echo -e "${YELLOW}Verifying installation...${NC}"
WATER_BODIES=$(docker exec smartwater-postgres psql -U postgres -d smartwaterwatch -t -c "SELECT COUNT(*) FROM water_bodies;")
echo -e "${GREEN}✓ Database has $WATER_BODIES water bodies${NC}"

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}Docker PostgreSQL Setup Complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo "PostgreSQL is running in Docker container:"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo "  - Database: smartwaterwatch"
echo "  - User: postgres"
echo "  - Password: postgres"
echo ""
echo "Container management:"
echo -e "  ${YELLOW}docker stop smartwater-postgres${NC}   # Stop container"
echo -e "  ${YELLOW}docker start smartwater-postgres${NC}  # Start container"
echo -e "  ${YELLOW}docker logs smartwater-postgres${NC}   # View logs"
echo ""
echo "Connect to database:"
echo -e "  ${YELLOW}PGPASSWORD=postgres psql -h localhost -U postgres -d smartwaterwatch${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: ./setup_backend.sh"
echo "  2. Run: npm install"
echo "  3. Run: ./test_installation.sh"
echo ""
