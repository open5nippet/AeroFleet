# AeroFleet 🚗💨

**AI Dashcam & Fleet Safety Platform** — a React Native mobile app for professional drivers, built with Expo.

---

## Features

- 📸 **Live Dashcam** — Record drives with configurable quality (480p → 4K)
- 🗺️ **Route Planner** — A→B navigation powered by Mapbox
- 📊 **Live Telemetry** — Speed, G-force, accelerometer, gyroscope
- 🚨 **SOS Alerts** — One-tap emergency alert with GPS location
- 📋 **Safety Events** — Logs harsh braking, sudden acceleration, crashes
- 🌙 **Dark / Light / System Theme**
- 👤 **Driver Profile** — Safety score, profile photo, vehicle info

---

## Project Structure

```
├── artifacts/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # Expo Router screens
│   │   │   ├── (tabs)/  # Main tab screens (dashboard, camera, map, events, profile)
│   │   │   ├── index.tsx    # Auth redirect entry
│   │   │   ├── intro.tsx    # Intro animation screen
│   │   │   └── login.tsx    # Driver login screen
│   │   ├── assets/      # Images, icons, splash screen, intro video
│   │   ├── components/  # Shared UI components (MapView, ErrorBoundary)
│   │   ├── constants/   # Color tokens
│   │   ├── context/     # React contexts (Auth, Recording, Theme)
│   │   ├── services/    # Mapbox geocoding & routing API
│   │   └── server/      # Static production server (for hosted deployment)
│   └── api-server/      # Express REST API backend
│       └── src/         # Routes, middleware, app entry
├── lib/
│   ├── api-client-react/ # Auto-generated React Query API client
│   ├── api-spec/         # OpenAPI spec (used by orval for codegen)
│   ├── api-zod/          # Zod validation schemas for API
│   └── db/               # Drizzle ORM schema and DB connection
└── pnpm-workspace.yaml   # Monorepo configuration
```

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Expo Go](https://expo.dev/go) on your phone (iOS or Android)

### Install

```bash
pnpm install
```

### Run the Mobile App

```bash
cd artifacts/mobile
pnpm dev
```

Scan the QR code with **Expo Go** on your phone.

### Run the API Server

```bash
cd artifacts/api-server
pnpm dev
```

---

## Environment Variables

### `artifacts/mobile/.env`

```env
EXPO_PUBLIC_MAPBOX_KEY=your_mapbox_public_token
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### `artifacts/api-server/.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aerofleet
PORT=3000
```

---

## Building for Production (Play Store / App Store)

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure EAS (one time)
eas build:configure

# Build Android APK / AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo (SDK 54) |
| Navigation | Expo Router (file-based) |
| Maps | Mapbox + React Native Maps |
| Camera | Expo Camera |
| State | React Context + TanStack Query |
| API | Express 5 + Drizzle ORM |
| Database | PostgreSQL |
| Language | TypeScript |
| Monorepo | pnpm workspaces |

---

## License

MIT
