#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Installing PostGIS for PostgreSQL 15...${NC}"
echo ""

# Install PostGIS
echo "Run this command:"
echo -e "${GREEN}sudo apt update && sudo apt install postgresql-15-postgis-3${NC}"
echo ""
