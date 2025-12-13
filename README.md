<div align="center">
  <br />
    <a href="https://github.com/iMayhem/Zenith" target="_blank">
      <img src="public/banner.png" alt="Project Banner" width="100%">
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=FFCA28" alt="firebase" />
  </div>

  <h3 align="center">Zenith - A Virtual Study Environment</h3>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. 🚀 [Features](#features)
3. ⚙️ [Tech Stack](#tech-stack)
4. 🔋 [Getting Started](#getting-started)
5. 🤝 [Contribution](#contribution)

## <a name="introduction">🤖 Introduction</a>

**Zenith** is an immersive virtual study environment designed to enhance productivity and focus. It brings users together in a shared digital space where they can track their study time, compete on leaderboards, and chat with peers.

Built with performance and aesthetics in mind, Zenith features a modern, dark-themed UI with glassmorphism effects, offering tools like a synchronized Pomodoro timer, study analytics, and a personal journal.

## <a name="features">🚀 Features</a>

- **Study Together Room**: Real-time presence system showing active users and their study duration.
- **Live Leaderboard**: Daily tracking of study minutes, resetting every 24 hours.
- **Integrated Chat**: Real-time chat with support for:
    - Text & Emojis
    - GIF Search (Giphy)
    - Image Uploads
    - Message Reactions
    - Replies & Unsend functionality
- **Personal Journal**: A dedicated space to log daily thoughts and progress with rich text and background customization.
- **Focus Tools**:
    - **Pomodoro Timer**: Customizable focus/break intervals.
    - **Ambient Music**: Built-in audio player for lo-fi beats.
- **Admin Panel**: Management tools for moderating the leaderboard and resetting stats.
- **Modern UI/UX**: Fully responsive design with Framer Motion animations and Radix UI primitives.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Backend & Real-time**: [Firebase Realtime Database](https://firebase.google.com/)
- **Storage**: Cloudflare R2 / Firebase Storage (for image uploads)
- **State Management**: React Context API
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## <a name="getting-started">🔋 Getting Started</a>

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Zenith.git
   ```

2. Install dependencies:
   ```bash
   cd Zenith
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env.local` file in the root directory and add your Firebase and API keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## <a name="contribution">🤝 Contribution</a>

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
