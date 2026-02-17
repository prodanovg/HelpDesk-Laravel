# HelpDesk Laravel + React

A Laravel-based HelpDesk system for managing support tickets, priorities, and routing with AI-powered ticket classification.

## Status: Finished 

## Prerequisites
- Docker Desktop installed and running

## How to Deploy

### 1. Clone the repository
git clone https://github.com/yourusername/helpdesk.git
cd helpdesk

### 2. Setup environment
Make sure that all .env files are correct for your settings!

### 3. Start all containers
docker compose up -d --build

### 4. Download AI model (first time only!)
docker compose exec ollama ollama pull gemma2:2b

### 5. Open the app
Go to: http://localhost

## Default Login Credentials

| Role     | Email                   | Password |
|----------|-------------------------|----------|
| Admin    | admin@example.com       | admin    |
| Manager  | manager@example.com     | manager  |
| Agent    | agent@example.com       | agent    |

## Features
- Role-based access control (Admin, Manager, Agent, Customer)-
- Ticket management (Create, Edit, Assign, Close, Delete)
- AI-powered ticket classification (Ollama + Gemma 2:2b)
- Team management
- User role management
- Filter tickets by status, priority, assignment
- Docker deployment ready

## Tech Stack
- **Backend:** Laravel 12 + PHP 8.2
- **Frontend:** React + TypeScript + Vite
- **Database:** MySQL 8.0
- **AI:** Ollama + Gemma 2:2b (local, free!) / if you have api key you can use Chat OpenAi too
- **Deployment:** Docker + Docker Compose
