# Slix

Modern movie streaming platform with personalized recommendations.

**Tech Stack:** React + Vite (frontend) | Go + Gin + MongoDB (backend)

## Local Development

```bash
# Backend
cd Server/MagicStreamMoviesServer
cp .env.example .env
go run main.go

# Frontend
cd Client/magic-stream-client
npm install
cp .env.example .env
npm run dev
```

## Production Updates

Since you already have deployments, follow these steps to update:

### 1. Update Go Module Path (after renaming GitHub repo)
```bash
cd Server/MagicStreamMoviesServer
go mod edit -module github.com/blackdragoon26/Slix/Server
go mod tidy
```

### 2. Update Render Environment Variables
Add these to your Render backend:
- `SECRET_KEY` (generate with: `openssl rand -base64 32`)
- `SECRET_REFRESH_KEY` (generate different one)
- `COOKIE_DOMAIN` (set to your backend domain)
- `ALLOWED_ORIGINS` (set to your frontend domain)

### 3. Update Vercel Environment Variables
Add to Vercel frontend:
- `VITE_API_BASE_URL` (set to your backend URL)

### 4. Push and Deploy
```bash
git add .
git commit -m "Rebrand to Slix and security improvements"
git push
```

Render and Vercel will auto-deploy.

## Changes Made

- Rebranded from MagicStreamMovies to Slix
- Added rate limiting middleware
- Added security headers
- Made cookie domains configurable
- Removed default secret keys (now required)
- Fixed hardcoded API URLs
- Removed debug print statements
