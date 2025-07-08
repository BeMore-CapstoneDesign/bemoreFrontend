# BeMore - Multimodal Emotion Analysis & CBT Feedback

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/BeMore-CapstoneDesign/bemoreFrontend)

> **BeMore** is an AI-powered web service for multimodal emotion analysis and CBT (Cognitive Behavioral Therapy) feedback. Analyze your emotions through facial expressions, voice, and text, and receive personalized feedback and visualized reports.

---

## 📂 Folder Structure

```
bemore-frontend/
├── public/                   # Static assets (images, icons)
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # Home page
│   │   ├── analysis/        # Emotion analysis page
│   │   ├── chat/            # AI chat page
│   │   ├── history/         # History page
│   │   └── settings/        # Settings page
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI components
│   │   ├── layout/          # Layout components
│   │   └── hoc/             # Higher-order components
│   ├── modules/             # Business logic
│   │   └── stores/          # Zustand state management
│   ├── services/            # API services & repositories
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript types
├── .env.example             # Environment variable example
├── package.json             # Project config
├── README.md                # Project documentation
└── ARCHITECTURE.md          # Architecture documentation
```

---

## 🚀 Features

### 📊 Emotion Analysis (Analysis)
- Facial analysis: Camera or image upload
- Voice analysis: Real-time recording or audio upload
- Text analysis: Input emotional text
- VAD visualization: Valence, Arousal, Dominance charts
- CBT feedback: Cognitive distortion detection & suggestions

### 💬 AI Chat (Chat)
- Gemini-powered AI counseling
- Context-aware responses based on recent analysis
- Quick suggestions for conversation starters
- Real-time typing indicator

### 📈 History (History)
- Track emotion changes over time
- Visualize with line and pie charts
- Filter by period, emotion, or search
- Download PDF reports

### ⚙️ Settings (Settings)
- Profile management
- Security (password, 2FA)
- Notification preferences
- Theme: Light/Dark/Auto

---

## 🔗 Core API Endpoints

| Method | Endpoint                                 | Description                |
| ------ | ---------------------------------------- | -------------------------- |
| POST   | `/api/emotion/analyze`                   | Multimodal emotion analysis|
| POST   | `/api/chat/gemini`                       | AI chat message            |
| GET    | `/api/history/:userId`                   | User emotion history       |
| GET    | `/api/user/profile`                      | Get user profile           |
| PUT    | `/api/user/profile`                      | Update user profile        |
| POST   | `/api/history/session/:sessionId/pdf`    | Generate PDF report        |

---

## 🛠️ Tech Stack

- **Next.js 15** (React framework)
- **TypeScript** (type safety)
- **TailwindCSS** (utility-first CSS)
- **Zustand** (state management)
- **Recharts** (data visualization)
- **Lucide React** (icons)
- **Axios** (API requests)

---

## ⚡ Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Git

### Installation

```bash
git clone https://github.com/BeMore-CapstoneDesign/bemoreFrontend.git
cd bemore-frontend
npm install # or yarn install
cp .env.example .env.local
```

### Running the App

```bash
npm run dev # or yarn dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### Build & Lint

```bash
npm run build
npm run start
npm run lint
```

---

## ⚙️ Environment Variables

| Variable                        | Description                | Default                      |
| ------------------------------- | -------------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL`           | Backend API URL            | `http://localhost:3001/api`  |
| `NEXT_PUBLIC_GEMINI_API_KEY`    | Google Gemini API Key      | -                            |
| `NEXT_PUBLIC_ANALYSIS_SERVER_URL`| Analysis server URL        | -                            |
| `NEXT_PUBLIC_APP_NAME`          | App name                   | `BeMore`                     |
| `NEXT_PUBLIC_APP_VERSION`       | App version                | `0.1.0`                      |

---

## 🧬 Ultrathink Engineering Principles
- First-principles design: Always ask "Why this way?"
- Domain separation: Clear responsibility per module
- Performance: Memoization, selective state subscription
- Scalability: Repository pattern, modular architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

---

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 📬 Contact
- **Repository**: [github.com/BeMore-CapstoneDesign/bemoreFrontend](https://github.com/BeMore-CapstoneDesign/bemoreFrontend)
- **Issues**: [github.com/BeMore-CapstoneDesign/bemoreFrontend/issues](https://github.com/BeMore-CapstoneDesign/bemoreFrontend/issues)

---

<div align="center">
Made with ❤️ by the BeMore Team
</div>