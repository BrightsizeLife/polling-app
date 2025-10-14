# ✨ Vibes

A modern polling app to create polls and gauge the vibe.

## Features

- Create and manage polls
- Real-time voting and results
- User authentication with Google OAuth
- Clean, modern interface
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Authentication:** Firebase Auth (Google OAuth + Email/Password)
- **Database:** Firestore (NoSQL real-time database)
- **Styling:** Inline styles (custom design system)
- **Hosting:** Vercel

## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## License

MIT
