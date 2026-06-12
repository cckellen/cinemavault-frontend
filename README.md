# CinemaVault Frontend

React TypeScript Single Page Application (SPA) for the CinemaVault film discovery platform (6003CEM Web API Development coursework).

## Features

- **Public browsing**: Search, filter (title, genre, year, rating), and sort films
- **Film details**: View plot, cast, director, ratings, and poster
- **Authentication**: Register, login, JWT session persistence
- **Favourites**: Save and manage favourite films
- **Watchlist / Watched**: Track viewing progress
- **Messages**: Contact administrator about films; admin can reply and delete
- **Profile**: Update username and upload profile photo
- **Admin panel**: Dashboard stats, CRUD film management + OMDB import
- **Responsive UI**: Dark cinema theme with Mantine, reusable MovieCard and page layouts

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Mantine UI
- Axios (centralised API client with interceptors)
- Zod (available for form validation)

## Prerequisites

- Node.js 18+
- CinemaVault Backend API running on port 5000

## Setup

```bash
npm install
cp .env.example .env
# Edit VITE_API_URL if backend is not at http://localhost:5000/api

npm run dev
```

App runs at `http://localhost:3000` (or port shown in terminal).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_MAX_UPLOAD_SIZE` | Max avatar upload bytes | `5242880` (5MB) |

## Admin Account

Register on the backend with an email containing `admin` (e.g. `admin@cinemavault.com`) to get ADMIN role. Then log in to access the Admin panel.

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/movies` | Public | Browse and search films |
| `/movies/:id` | Public | Film detail page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/favorites` | Auth | User favourites |
| `/watchlist` | Auth | Watchlist and watched |
| `/messages` | Auth | Messaging |
| `/profile` | Auth | Profile and avatar upload |
| `/admin/movies` | Admin | Film management |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/     # Reusable UI (Navbar)
├── contexts/       # React context (AuthContext)
├── pages/          # Route page components
├── services/       # API client (axios)
├── types/          # TypeScript interfaces
├── App.tsx         # Router and layout
└── main.tsx        # Entry point
```

## API Integration

All API calls go through `src/services/api.ts` which:
- Sets the base URL from environment
- Attaches JWT token from localStorage
- Handles 401 responses (redirect to login)
- Sets 15s request timeout
