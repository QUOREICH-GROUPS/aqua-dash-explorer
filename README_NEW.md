# SmartWaterWatch 🌊

> AI-Powered Water Resources Monitoring Platform for Burkina Faso

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.3+-4169E1?style=flat&logo=postgresql)](https://postgis.net/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

An advanced platform for monitoring water resources using satellite imagery, AI analysis, and real-time data visualization. Focused on Burkina Faso's water bodies with integration of agricultural zones and weather forecasting.

![Architecture](https://img.shields.io/badge/Architecture-PostgreSQL%20%2B%20FastAPI%20%2B%20React-blue)

---

## ✨ Features

### 🗺️ Interactive 3D Mapping
- **ArcGIS Integration**: Visualize water bodies in stunning 3D
- **Drawing Tools**: Draw custom analysis areas on the map
- **Satellite Layers**: Regional boundaries and agricultural zones
- **Real-time Interaction**: Click, zoom, and explore interactively

### 💧 Water Body Management
- **10 Major Water Bodies**: Pre-loaded data for Burkina Faso
- **Time Series Data**: 90 days of historical measurements
- **NDWI Tracking**: Normalized Difference Water Index monitoring
- **Surface Area Analysis**: Track water surface changes over time

### 🌾 Agriculture Integration
- **5 Agricultural Zones**: Maïs, Coton, Riz, Mil, Sorgho
- **Crop Yield Data**: Average productivity per zone
- **Spatial Queries**: Find agriculture zones near water bodies
- **Irrigation Analysis**: Water availability for farming

### 🤖 AI-Powered Analysis
- **Satellite Imagery**: Sentinel-2 data processing (planned)
- **Water Segmentation**: U-Net deep learning model (planned)
- **Forecasting**: 7-day surface area predictions (planned)
- **Anomaly Detection**: Automatic alert generation (planned)

### 🌤️ Weather Integration
- **Real-time Data**: Integration with Open-Meteo API
- **3-Day Forecast**: Temperature and precipitation
- **Historical Trends**: Weather impact on water levels

### 📊 Analytics Dashboard
- **Statistics**: Total measurements, trends, status
- **Charts**: Time series visualizations with Recharts
- **Alerts**: Critical water level notifications
- **Export**: Data export to CSV/PDF

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐ │
│  │   ArcGIS    │  │  Zustand │  │  React Query   │ │
│  │  3D Maps    │  │  Stores  │  │  (API Client)  │ │
│  └─────────────┘  └──────────┘  └────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend (FastAPI)                       │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐           │
│  │   API   │  │  CRUD   │  │ Services │           │
│  │ Routes  │  │   Ops   │  │ (ML/AI)  │           │
│  └─────────┘  └─────────┘  └──────────┘           │
└──────────────────────┬──────────────────────────────┘
                       │ SQLAlchemy
                       ▼
┌─────────────────────────────────────────────────────┐
│         PostgreSQL 15 + PostGIS 3.3                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Water Bodies │  │ Measurements │  │ Analysis │ │
│  │ (Geospatial) │  │(Time Series) │  │ Results  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ with PostGIS

### Installation (5 minutes)

#### Option 1: Automated Setup

**Linux/macOS:**
```bash
./setup.sh
```

**Windows PowerShell:**
```powershell
.\setup.ps1
```

#### Option 2: Manual Setup

```bash
# 1. Database setup
psql -U postgres -c "CREATE DATABASE smartwaterwatch;"
psql -U postgres -d smartwaterwatch -c "CREATE EXTENSION postgis;"
psql -U postgres -d smartwaterwatch -f database/schema.sql
psql -U postgres -d smartwaterwatch -f database/seeds/001_initial_data.sql

# 2. Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 3. Frontend setup
cd ..
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Access:**
- Frontend: http://localhost:8080
- API Docs: http://localhost:8000/docs
- API: http://localhost:8000/api/v1

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](QUICK_START.md) | Get started in 5 minutes |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Complete setup and development guide |
| [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) | Architecture and migration plan |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current status and roadmap |
| [CLAUDE.md](CLAUDE.md) | AI assistant project overview |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **ArcGIS JS API** - 3D mapping
- **Zustand** - State management
- **React Query** - Server state
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **GeoAlchemy2** - Geospatial ORM
- **Uvicorn** - ASGI server

### Database
- **PostgreSQL 15** - Relational database
- **PostGIS 3.3** - Geospatial extension

### AI/ML (Planned)
- **TensorFlow** - Deep learning
- **Scikit-learn** - ML algorithms
- **Prophet** - Time series forecasting
- **Sentinel Hub** - Satellite imagery

---

## 📊 Database Schema

```sql
water_bodies
├── id (UUID)
├── name (VARCHAR)
├── region (VARCHAR)
├── type (lake|river|reservoir|wetland)
├── geometry (POLYGON)
├── centroid (GEOGRAPHY POINT)
├── surface_area_ha (DECIMAL)
└── metadata (JSONB)

water_measurements
├── id (UUID)
├── water_body_id (FK)
├── measurement_date (DATE)
├── surface_area_ha (DECIMAL)
├── ndwi_average (DECIMAL)
└── source (VARCHAR)

agriculture_zones
├── id (UUID)
├── region (VARCHAR)
├── crop_type (VARCHAR)
├── geometry (POLYGON)
└── average_yield (DECIMAL)
```

---

## 🌍 Data Coverage

### Water Bodies
- Barrage de Bagré (23,500 ha)
- Barrage de Kompienga (19,400 ha)
- Barrage de Sourou (15,600 ha)
- Barrage de Samendeni (12,800 ha)
- And 6 more...

### Agricultural Zones
- Maïs (Centre) - 12,500 ha
- Coton (Est) - 15,200 ha
- Riz (Hauts-Bassins) - 8,900 ha
- Mil (Centre-Nord) - 18,700 ha
- Sorgho (Sud-Ouest) - 10,300 ha

### Time Series
- 90 days of historical measurements
- ~900 data points
- Satellite + model predictions

---

## 🔌 API Endpoints

### Water Bodies
```
GET    /api/v1/water-bodies/           # List all
GET    /api/v1/water-bodies/{id}       # Get one
POST   /api/v1/water-bodies/           # Create
PATCH  /api/v1/water-bodies/{id}       # Update
DELETE /api/v1/water-bodies/{id}       # Delete
GET    /api/v1/water-bodies/{id}/measurements
GET    /api/v1/water-bodies/{id}/stats
```

### Coming Soon
```
POST   /api/v1/analysis/               # AI analysis
GET    /api/v1/agriculture-zones/
GET    /api/v1/weather/
POST   /api/v1/ml/segment
POST   /api/v1/ml/forecast
```

---

## 🔧 Development

### Backend Development
```bash
cd backend
source venv/bin/activate

# Run server with auto-reload
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Format code
black app/
isort app/
```

### Frontend Development
```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Management
```bash
# Connect to database
psql -U postgres -d smartwaterwatch

# Run migrations
cd backend
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests (to be added)
npm test

# E2E tests (to be added)
npm run test:e2e
```

---

## 📈 Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Database schema with PostGIS
- [x] FastAPI backend with CRUD operations
- [x] Frontend API integration layer
- [x] Documentation and setup scripts

### Phase 2: Analysis Features 🔄 (In Progress)
- [ ] Analysis endpoint with geometry intersection
- [ ] Weather API integration
- [ ] Agriculture zone queries
- [ ] Dashboard with real API data

### Phase 3: AI/ML Integration 📅 (Planned)
- [ ] Sentinel-2 satellite data download
- [ ] NDWI calculation from imagery
- [ ] Water segmentation model (U-Net)
- [ ] Time series forecasting (LSTM)
- [ ] Anomaly detection

### Phase 4: Advanced Features 📅 (Future)
- [ ] User authentication
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Admin dashboard
- [ ] Data export tools

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Project Team** - Initial work

---

## 🙏 Acknowledgments

- **Burkina Faso Ministry of Water Resources**
- **Sentinel-2 ESA** - Satellite imagery
- **Open-Meteo** - Weather data API
- **ArcGIS** - Mapping platform
- **FastAPI** - Backend framework
- **React** - Frontend library

---

## 📞 Support

- Documentation: See docs in repository
- Issues: [GitHub Issues](https://github.com/yourusername/smartwaterwatch/issues)
- Email: support@smartwaterwatch.com

---

**Made with ❤️ for sustainable water management in Burkina Faso**
