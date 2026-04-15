# Vent Pod - Anonymous Emotional Support Platform

This is a full-stack web application designed to offer instantaneous anonymous emotional support with a premium, robust user interface.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB Atlas)

## How to Run Locally

### Prerequisites
- Node.js (v16+ recommended)
- A MongoDB URI (Cloud/Atlas)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend folder and add your MongoDB connection string (see `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster0.mongodb.net/ventpod?retryWrites=true&w=majority
   ```
4. Start the server (it will run on http://localhost:5000):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new, separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Usage
- Go to the URL provided by Vite (usually `http://localhost:5173`).
- You will see the Netflix-style animated intro.
- Click "Start Venting", select your mood, and you'll be placed into matchmaking.
- Open the application in an incognito window or another browser concurrently to match with yourself and test the chat!
