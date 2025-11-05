# 🌊 Plateforme de Surveillance des Ressources en Eau

Une application web moderne et complète pour la surveillance, l'analyse et la gestion des ressources en eau au Maroc. Cette plateforme combine cartographie interactive, analyse satellite par IA, et outils de collaboration pour une gestion optimale des ressources hydriques.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [API et Services](#api-et-services)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [License](#license)

## 🎯 Aperçu

Cette plateforme offre une solution complète pour le monitoring des ressources en eau, incluant :

- **Cartographie Interactive** : Visualisation des points d'eau, barrages, lacs et zones agricoles sur carte ArcGIS
- **Analyse Satellite IA** : Analyse automatisée de la surface et qualité de l'eau via données Sentinel-2
- **Stations Météo** : Intégration des données météorologiques en temps réel
- **Tableaux de Bord** : Visualisation des indicateurs clés et historique des analyses
- **Collaboration** : Gestion des utilisateurs, zones favorites et annotations
- **Export** : Génération de rapports PDF et export de données

## ✨ Fonctionnalités

### 🗺️ Cartographie

- Carte interactive basée sur ArcGIS avec multiples couches (satellite, topographique, etc.)
- Couches administratives (régions, provinces, communes)
- Couches thématiques (zones agricoles, points d'eau, barrages, lacs)
- Outils de mesure (distance, surface)
- Dessin et annotation de zones
- Contrôle de l'opacité et visibilité des couches
- Légende interactive et personnalisable

### 📊 Analyse de Données

- **Analyse IA** : Détection automatique des surfaces en eau via intelligence artificielle
- **Indices NDWI** : Calcul du Normalized Difference Water Index
- **Données Temporelles** : Graphiques d'évolution sur période sélectionnée
- **Anomalies** : Détection automatique des variations anormales
- **Prévisions** : Projections basées sur l'historique des données
- **Alertes** : Système de notifications pour événements critiques

### 🌤️ Météorologie

- Intégration de stations météorologiques
- Données en temps réel (température, précipitations, humidité)
- Widget météo avec prévisions
- Filtrage par localisation et type de station

### 👥 Collaboration

- **Authentification** : Système de connexion/inscription sécurisé
- **Rôles Utilisateurs** : Admin, Modérateur, Utilisateur
- **Zones Favorites** : Sauvegarde de zones d'intérêt
- **Annotations** : Notes et commentaires sur la carte
- **Profils** : Gestion des informations utilisateur et organisation

### 📈 Tableaux de Bord

- Statistiques agrégées des ressources en eau
- Graphiques interactifs (Chart.js, Recharts)
- Historique des analyses effectuées
- Indicateurs de performance clés
- Filtres et périodes personnalisables

### 📄 Export

- Génération de rapports PDF complets
- Export des données en formats divers
- Inclusion de cartes, graphiques et analyses
- Personnalisation des rapports

## 🛠️ Technologies

### Frontend

- **React 18.3.1** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI modernes
- **ArcGIS Maps SDK** - Cartographie interactive
- **Chart.js & Recharts** - Visualisation de données
- **React Router** - Navigation
- **Zustand** - Gestion d'état
- **React Hook Form** - Gestion de formulaires
- **Zod** - Validation de schémas

### Backend (Lovable Cloud / Supabase)

- **Lovable Cloud** - Backend complet managé
- **PostgreSQL** - Base de données
- **Row Level Security** - Sécurité des données
- **Edge Functions** - Fonctions serverless
- **Authentication** - Gestion des utilisateurs
- **Real-time** - Mises à jour en temps réel

### Services Externes

- **Sentinel-2** - Données satellite
- **OpenWeather / APIs Météo** - Données météorologiques
- **Lovable AI** - Analyse IA des images satellite

## 📦 Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0 ou yarn >= 1.22.0
- Compte Lovable (pour le backend)

## 🚀 Installation

### 1. Cloner le Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration des Variables d'Environnement

Les variables d'environnement sont gérées automatiquement par Lovable Cloud. Le fichier `.env` est généré automatiquement et contient :

```env
VITE_SUPABASE_URL=<auto-généré>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-généré>
VITE_SUPABASE_PROJECT_ID=<auto-généré>
```

### 4. Lancer le Serveur de Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## ⚙️ Configuration

### Authentification

L'authentification est configurée avec auto-confirmation des emails activée pour le développement. Pour modifier :

1. Accédez aux paramètres Cloud dans Lovable
2. Section Authentication
3. Ajustez les paramètres selon vos besoins

### Rôles et Permissions

Trois rôles sont disponibles :

- **admin** : Accès complet, gestion des utilisateurs et rôles
- **moderator** : Gestion du contenu et modération
- **user** : Accès standard aux fonctionnalités

Les rôles sont gérés via la table `user_roles` avec RLS policies appropriées.

### Secrets

Pour configurer des clés API supplémentaires (ex: APIs météo tierces), utilisez la gestion des secrets de Lovable Cloud :

```bash
# Via l'interface Lovable
Settings → Cloud → Secrets → Add Secret
```

## 📖 Utilisation

### 1. Authentification

```typescript
// Se connecter
import { useAuth } from '@/hooks/useAuth';

const { signIn, user } = useAuth();
await signIn('email@example.com', 'password');

// S'inscrire
await signUp('email@example.com', 'password', 'Nom d'affichage');

// Se déconnecter
await signOut();
```

### 2. Analyse de Zone d'Eau

```typescript
import { useWaterAnalysis } from '@/hooks/useWaterAnalysis';

const { analyzeWaterBody, result, isAnalyzing } = useWaterAnalysis();

// Analyser une zone
const analysis = await analyzeWaterBody(
  geometry, // GeoJSON de la zone
  {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    cloudCoverage: 20
  }
);
```

### 3. Gestion des Stores

```typescript
// Store de la carte
import { useMapStore } from '@/stores/mapStore';
const { selectedLayer, setSelectedLayer } = useMapStore();

// Store des filtres
import { useFilterStore } from '@/stores/filterStore';
const { dateRange, setDateRange } = useFilterStore();

// Store d'analyse
import { useAnalysisStore } from '@/stores/analysisStore';
const { currentAnalysis } = useAnalysisStore();
```

## 📁 Structure du Projet

```
├── src/
│   ├── components/          # Composants React
│   │   ├── dashboard/       # Composants du tableau de bord
│   │   ├── layout/          # Layout (Header, Footer, Sidebar)
│   │   ├── map/             # Composants cartographiques
│   │   └── ui/              # Composants UI (shadcn)
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useAuth.tsx      # Hook d'authentification
│   │   ├── useWaterAnalysis.ts # Hook d'analyse
│   │   └── use-toast.ts     # Hook de notifications
│   ├── pages/               # Pages de l'application
│   │   ├── Index.tsx        # Page d'accueil
│   │   ├── Map.tsx          # Page carte
│   │   ├── Dashboard.tsx    # Tableau de bord
│   │   └── Auth.tsx         # Authentification
│   ├── stores/              # Stores Zustand
│   │   ├── mapStore.ts      # État de la carte
│   │   ├── filterStore.ts   # État des filtres
│   │   └── analysisStore.ts # État des analyses
│   ├── utils/               # Utilitaires
│   │   ├── exportUtils.ts   # Export de données
│   │   └── pdfExport.ts     # Génération PDF
│   ├── data/                # Données statiques
│   ├── integrations/        # Intégrations externes
│   │   └── supabase/        # Client Supabase (auto-généré)
│   └── lib/                 # Bibliothèques utilitaires
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── satellite-data/  # API données satellite
│   │   ├── water-analysis-ai/ # Analyse IA
│   │   └── weather-stations/ # Stations météo
│   └── migrations/          # Migrations de base de données
├── public/                  # Fichiers statiques
└── index.html              # Point d'entrée HTML
```

## 🔌 API et Services

### Edge Functions

#### 1. satellite-data

Récupère les données satellite Sentinel-2 pour une zone et période données.

```typescript
const { data } = await supabase.functions.invoke('satellite-data', {
  body: {
    geometry: { type: 'Polygon', coordinates: [...] },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    cloudCoverage: 20
  }
});
```

#### 2. water-analysis-ai

Analyse IA de la surface en eau avec calcul NDWI, détection d'anomalies et prévisions.

```typescript
const { data } = await supabase.functions.invoke('water-analysis-ai', {
  body: {
    geometry: { type: 'Polygon', coordinates: [...] },
    parameters: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  }
});
```

#### 3. weather-stations

Récupère les données des stations météorologiques.

```typescript
const { data } = await supabase.functions.invoke('weather-stations', {
  body: {
    location: { lat: 33.5731, lon: -7.5898 },
    radius: 50 // km
  }
});
```

### Base de Données

#### Tables Principales

- **profiles** : Profils utilisateurs
- **user_roles** : Rôles et permissions
- **favorite_zones** : Zones favorites sauvegardées
- **user_annotations** : Annotations sur la carte
- **analysis_history** : Historique des analyses (si implémenté)

Toutes les tables sont protégées par Row Level Security (RLS).

## 🚢 Déploiement

### Via Lovable (Recommandé)

1. Ouvrez votre projet sur [Lovable](https://lovable.dev/projects/37ecae17-b322-4aa5-961e-a56c6532c23d)
2. Cliquez sur **Publish** dans le coin supérieur droit
3. Cliquez sur **Update** pour déployer les dernières modifications
4. Votre application est déployée !

**Note** : Les changements backend (Edge Functions, migrations) sont déployés automatiquement.

### Domaine Personnalisé

1. Allez dans **Project → Settings → Domains**
2. Cliquez sur **Connect Domain**
3. Suivez les instructions pour configurer votre DNS

### Self-Hosting

Pour déployer sur votre propre infrastructure :

```bash
# Build de production
npm run build

# Le dossier dist/ contient les fichiers statiques
# Déployez sur Vercel, Netlify, ou tout hébergeur statique
```

Consultez la [documentation Lovable](https://docs.lovable.dev/tips-tricks/self-hosting) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Suivez les conventions de code TypeScript
- Utilisez les composants shadcn/ui existants
- Respectez le design system (Tailwind semantic tokens)
- Ajoutez des tests si applicable
- Documentez les nouvelles fonctionnalités

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Build
npm run build        # Compile pour la production
npm run preview      # Prévisualise le build de production

# Qualité du Code
npm run lint         # Vérifie le code avec ESLint
npm run type-check   # Vérifie les types TypeScript

# Supabase (si configuré localement)
npx supabase start   # Démarre Supabase localement
npx supabase stop    # Arrête Supabase local
```

## 🔒 Sécurité

- Toutes les données sont protégées par Row Level Security (RLS)
- Authentification sécurisée via Lovable Cloud / Supabase Auth
- Les clés API sont stockées en tant que secrets sécurisés
- HTTPS obligatoire en production
- Validation des entrées avec Zod
- Protection CSRF et XSS

## 📊 Performance

- Build optimisé avec Vite
- Code-splitting automatique
- Lazy loading des composants
- Optimisation des images
- Mise en cache des requêtes API
- Real-time avec websockets Supabase

## 🐛 Résolution de Problèmes

### Problèmes de Connexion à Lovable Cloud

Si vous rencontrez des erreurs de connexion :
1. Vérifiez que les variables d'environnement sont correctes
2. Redémarrez le serveur de développement
3. Videz le cache du navigateur

### Problèmes de Carte ArcGIS

Si la carte ne s'affiche pas :
1. Vérifiez la console pour les erreurs
2. Assurez-vous que les dépendances ArcGIS sont installées
3. Vérifiez la connexion internet

### Problèmes d'Authentification

Si l'authentification échoue :
1. Vérifiez que l'auto-confirmation est activée (dev)
2. Consultez les logs dans Lovable Cloud
3. Vérifiez les RLS policies

## 📚 Ressources

- [Documentation Lovable](https://docs.lovable.dev/)
- [Documentation ArcGIS Maps SDK](https://developers.arcgis.com/javascript/)
- [Documentation Supabase](https://supabase.com/docs)
- [Sentinel-2 Documentation](https://sentinel.esa.int/web/sentinel/missions/sentinel-2)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 📧 Contact

Pour toute question ou support :
- Email : support@votreplateforme.com
- Discord : [Communauté Lovable](https://discord.com/channels/1119885301872070706)

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Lovable Project URL** : https://lovable.dev/projects/37ecae17-b322-4aa5-961e-a56c6532c23d

Développé avec ❤️ en utilisant [Lovable](https://lovable.dev)
