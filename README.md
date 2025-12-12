# MemoWord - AI-Powered Vocabulary Learning Platform

MemoWord is an intelligent web application designed to help users efficiently learn and retain new vocabulary. It leverages a custom-trained AI model to implement a Spaced Repetition System (SRS), personalizing the learning experience by predicting when a user is most likely to forget a word and quizzing them on it accordingly.

## Core Features

- **AI-Powered Smart Quiz**: Utilizes a deep learning model (LSTM) to predict the probability of word recall, creating optimized quizzes that focus on words you're about to forget.
- **Vocabulary Dashboard**: A central hub to add, manage, and review your vocabulary list.
- **Multiple Quiz Modes**: Engage with your vocabulary through various formats, including flashcards, multiple-choice questions, and fill-in-the-blank exercises.
- **Learning Analytics**: Track your progress, view your learning streaks, and gain insights into your study habits.
- **User Authentication**: Securely manage your personal vocabulary lists and track your progress across sessions.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Python, Firebase Cloud Functions
- **Database**: Google Firestore
- **AI Model**: TensorFlow (Keras)
- **Deployment**: Firebase Hosting

## Project Structure

The project is a monorepo containing two main parts: the frontend application and the backend serverless functions.

```
/
├── functions/      # Backend: Python on Firebase Cloud Functions
│   ├── main.py     # --- Backend Entry Point: Defines cloud functions (API endpoints, triggers)
│   ├── model.keras # Pre-trained TensorFlow model for recall prediction
│   └── ...
│
├── src/            # Frontend: React + TypeScript SPA
│   ├── main.tsx    # --- Frontend Entry Point
│   ├── App.tsx     # Main application component with routing
│   ├── pages/      # Top-level page components (Dashboard, Quiz, etc.)
│   ├── features/   # Feature-sliced modules (Auth, Learning, etc.)
│   ├── components/ # Reusable UI components
│   └── ...
│
├── firebase.json   # Firebase configuration for hosting and functions
├── package.json    # Frontend dependencies and scripts
└── ...
```

- **Frontend Entry Point**: `src/main.tsx` initializes the React application and renders it into the DOM.
- **Backend Entry Point**: `functions/main.py` defines the callable cloud functions that serve the AI predictions and other backend logic.

## Installation and Running

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Python](https://www.python.org/) (v3.9 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### 1. Frontend Setup

First, set up the React client.

```bash
# 1. Clone the repository
git clone <repository-url>
cd memoryword

# 2. Install frontend dependencies
npm install

# 3. Configure Firebase
#    - Copy the contents of .env.example into a new .env file
#    - Fill in the .env file with your Firebase project's configuration.
#      You can get this from your Firebase project settings.
cp .env.example .env

# 4. Run the development server
npm run dev
```

The application should now be running on `http://localhost:5173`.

### 2. Backend Setup

Next, set up the Firebase Functions backend.

```bash
# 1. Navigate to the functions directory
cd functions

# 2. Create a virtual environment and activate it
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set up Google Application Credentials
#    Follow the guide to authenticate the Firebase Admin SDK:
#    https://cloud.google.com/docs/authentication/provide-credentials-adc
```

To test the functions locally, you can use the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite).

## Deployment

To deploy the application to Firebase:

```bash
# 1. Build the frontend for production
npm run build

# 2. Deploy both the frontend (Hosting) and backend (Functions)
firebase deploy
```