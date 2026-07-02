<p align="center">
<img width="68" height="67" alt="MagicStreamLogo" src="https://github.com/user-attachments/assets/89b5637c-8733-4a12-a7b4-fabe9d204a3d" />

</p>

<h1 align="center">Flix</h1>

<p align="center">
Movie Streaming Platform built with React, Go, MongoDB and AI powered recommendations.
</p>

---

## What is Flix?

Flix is a full-stack movie streaming platform built to experiment with modern web technologies and AI.

It is not trying to become another Netflix clone. The goal was to build a complete system that has a frontend, backend, database, cloud deployment and an AI service working together.

The application lets users browse movies, watch trailers, see where movies are available to stream, and get AI generated recommendations based on natural language prompts.

The recommendation system is built using LangChainGo with GPT-5.1-mini running through Azure OpenAI Foundry.

---

## Features

- React frontend
- Go backend using gin-gonic
- MongoDB Atlas database
- AI movie recommendation engine
- Search movies
- Movie details page
- Movie reviews
- Admin review management
- Watch trailers
- Streaming availability using JustWatch API
- Responsive UI
- REST API
- Cloud deployment

---

## Tech Stack

| Layer | Tech |
|--------|------|
| Frontend | React |
| Backend | Go |
| Framework | gin-gonic |
| Database | MongoDB Atlas |
| AI | LangChainGo + Azure OpenAI (GPT-5.1-mini) |
| Movie Provider | JustWatch API |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## Architecture

```
                 +----------------------+
                 |      React UI        |
                 |       Vercel         |
                 +----------+-----------+
                            |
                         REST API
                            |
                            v
              +---------------------------+
              | Go Backend (gin-gonic)    |
              |          Render           |
              +-----------+---------------+
                          |
        +-----------------+------------------+
        |                 |                  |
        |                 |                  |
        v                 v                  v
 MongoDB Atlas      Azure OpenAI       JustWatch API
 Movie Storage      GPT-5.1-mini      Streaming Info
```

---

## AI Recommendation

Instead of simple genre matching, recommendations are generated using an LLM.

The backend uses:

- LangChainGo
- Azure OpenAI Foundry
- GPT-5.1-mini

The model understands natural language queries like

> "Recommend me slow psychological thrillers with a dark ending."

or

> "Something similar to Interstellar but less confusing."

The response is then matched with movies stored in the database.

---

## Streaming Availability

Movie availability is fetched using JustWatch API.

Users can directly see where a movie is currently available to stream instead of manually searching every OTT platform.

---

## Project Structure

```
Flix
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── ai/
│   ├── database/
│   └── main.go
│
└── README.md
```

---

## Running Locally

### Clone

```bash
git clone https://github.com/blackdragoon26/MagicStreamMovies.git

cd MagicStreamMovies
```

---

### Backend

```bash
cd backend

go mod tidy

go run main.go
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Backend

```env
MONGODB_URI=

AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=gpt-5.1-mini

JUSTWATCH_API_KEY=
```

Frontend

```env
VITE_API_URL=
```

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- MongoDB Atlas

---

## Screenshots

Coming soon.

---

## Future Work

- User authentication
- Watchlists
- Personalized recommendations per user
- Continue Watching
- Better search ranking
- Recommendation history
- Vector search
- Movie similarity embeddings
- Admin dashboard
- Redis caching

---

## Why I Built This

I wanted one project that combines frontend, backend, databases, cloud deployment and AI into one system.

Most AI demos stop at calling an API.

Here the AI is treated like another backend service that works with the application instead of replacing it.

It was also a good excuse to write production-ish Go code and learn LangChainGo.

---

## Repository

https://github.com/blackdragoon26/MagicStreamMovies

---

## License

MIT
