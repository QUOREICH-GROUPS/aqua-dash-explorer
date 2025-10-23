# PostgreSQL Setup for SmartWaterWatch

## Current Issue
PostgreSQL authentication needs to be configured for user `suprox`.

## Quick Fix (Choose One Option)

### Option 1: Use PostgreSQL with Password Authentication (Recommended)

```bash
# Step 1: Switch to postgres user and access PostgreSQL
sudo -i -u postgres

# Step 2: Create database and user
psql << EOF
-- Create database
CREATE DATABASE smartwaterwatch;

-- Create user with password
CREATE USER suprox WITH PASSWORD 'your_password_here';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE smartwaterwatch TO suprox;

-- Connect to database and grant schema privileges
\c smartwaterwatch
GRANT ALL ON SCHEMA public TO suprox;

-- Exit
\q
EOF

# Step 3: Exit postgres user
exit
```

### Option 2: Modify PostgreSQL Authentication

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Change this line:
# local   all             postgres                                peer

# To:
# local   all             postgres                                md5
# local   all             all                                     md5

# Save and restart PostgreSQL
sudo systemctl restart postgresql
```

### Option 3: Use Docker PostgreSQL (Easiest)

```bash
# Run PostgreSQL in Docker with PostGIS
docker run --name smartwater-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smartwaterwatch \
  -p 5432:5432 \
  -d postgis/postgis:15-3.3

# Wait a few seconds for container to start
sleep 5

# Install PostGIS extension
docker exec smartwater-postgres psql -U postgres -d smartwaterwatch \
  -c "CREATE EXTENSION IF NOT EXISTS postgis;"

docker exec smartwater-postgres psql -U postgres -d smartwaterwatch \
  -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

## After PostgreSQL is Configured

### Test Connection
```bash
# Test with password (Option 1 or 2)
psql -U suprox -d postgres -c "SELECT version();"

# OR test with Docker (Option 3)
PGPASSWORD=postgres psql -h localhost -U postgres -d smartwaterwatch -c "SELECT version();"
```

### Apply Database Schema

#### For Option 1 or 2 (Local PostgreSQL):
```bash
cd /home/suprox/Projet/Laravel/aqua-dash-explorer

# Apply schema
psql -U suprox -d smartwaterwatch -f database/schema.sql

# Seed data
psql -U suprox -d smartwaterwatch -f database/seeds/001_initial_data.sql
```

#### For Option 3 (Docker):
```bash
cd /home/suprox/Projet/Laravel/aqua-dash-explorer

# Apply schema
PGPASSWORD=postgres psql -h localhost -U postgres -d smartwaterwatch -f database/schema.sql

# Seed data
PGPASSWORD=postgres psql -h localhost -U postgres -d smartwaterwatch -f database/seeds/001_initial_data.sql
```

## Update Backend Configuration

### For Local PostgreSQL (Option 1 or 2):
```bash
# Create backend/.env
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://suprox:your_password_here@localhost:5432/smartwaterwatch
EOF
```

### For Docker PostgreSQL (Option 3):
```bash
# Create backend/.env
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartwaterwatch
EOF
```

## Verify Installation

```bash
# Check database exists
psql -U suprox -d smartwaterwatch -c "\dt" # Option 1/2
# OR
PGPASSWORD=postgres psql -h localhost -U postgres -d smartwaterwatch -c "\dt" # Option 3

# Expected output:
#                  List of relations
#  Schema |        Name         | Type  |  Owner
# --------+---------------------+-------+---------
#  public | agriculture_zones   | table | suprox
#  public | alerts              | table | suprox
#  public | analysis_results    | table | suprox
#  public | water_bodies        | table | suprox
#  public | water_measurements  | table | suprox
#  public | weather_data        | table | suprox
```

## Continue with Backend Setup

Once database is ready:
```bash
cd /home/suprox/Projet/Laravel/aqua-dash-explorer

# Continue with setup_backend.sh
./setup_backend.sh
```
