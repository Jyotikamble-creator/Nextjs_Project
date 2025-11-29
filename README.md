# VidoraFrameForge 🎥📸📝✍️

A modern full-stack video, photo, and journal sharing platform built using the latest Next.js 15 architecture and a scalable backend powered by MongoDB + Mongoose.
VidoraFrameForge is a unified media sharing and digital journaling platform where users can securely upload videos and photos, compose rich journals with attachments, track activity stats, maintain streaks, and export their memories as PDFs — all inside a responsive, beautifully blurred glass UI.

## ✨ Features

### 🔐 Authentication & User Management
- Secure signup/login with email and password
- Password strength & email validation
- JWT-based session handling and streak & stats tracking

### 📸 Photo Management
- Upload photos with rich metadata (tags, albums, location)
- Responsive grid-based browsing and delete support

### 🎥 Video Management
- Upload videos with categorize & tag support
- Public/private visibility options
- Video cards with CRUD operations

### ✍️ Journaling System
- Create journals with mood & attachment support
- Browse all journal entries
- Attach media files using a unified upload system

### 📊 Dashboard & Analytics
- Real-time activity feed
- User statistics tracking (media count, streaks, journals)
- Charts and progress visualization
- Memory export as PDF

### 📎 File Upload System
- Reusable drag-and-drop upload interface
- Shared upload utility
- File validation before upload
- Backend-signed upload authentication (ImageKit – WIP)

## 🧠 Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Frontend** | Next.js 15, React 18, TypeScript        |
| **Backend**  | Next.js API Routes, MongoDB, Mongoose   |
| **Auth**     | NextAuth.js (JWT + Credentials Provider)|
| **Storage**  | ImageKit                                |
| **Styling**  | Tailwind CSS                            |
| **Icons**    | Lucide React                            |
| **Export**   | jsPDF, html2canvas                      |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jyotikamble-creator/Nextjs_Project.git
   cd Nextjs_Project/vidoraframeforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Update the `.env.local` file with your configuration:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/vidoraframeforge
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   IMAGEKIT_ID=your-imagekit-id
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
   NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint
   IMAGEKIT_PRIVATE_KEY=your-private-key
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
vidoraframeforge/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard page
│   │   └── upload-*/       # Upload pages
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── home/           # Landing page components
│   │   └── video/          # Video-related components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── server/             # Backend utilities
│   │   ├── models/         # Mongoose schemas
│   │   └── auth-config/    # Authentication configuration
│   ├── types/              # TypeScript type definitions
│   └── ui/                 # UI components
├── public/                 # Static assets
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/vidoraframeforge

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-in-production

# ImageKit Configuration
IMAGEKIT_ID=your-imagekit-id
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint
IMAGEKIT_PRIVATE_KEY=your-private-key

# Optional
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=http://localhost:3000
```
-----

## Project Overview

------
## 🌐 Live Demo

🚀 **Website:** 

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

