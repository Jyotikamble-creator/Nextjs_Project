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

<img width="1920" height="900" alt="home" src="https://github.com/user-attachments/assets/d4bfe8f4-5595-482c-828c-b9ba0f5322bd" />

<img width="1920" height="900" alt="auth" src="https://github.com/user-attachments/assets/f73e58d9-d9e1-48eb-9793-aa35d662b45e" />

<img width="1920" height="900" alt="dashboard" src="https://github.com/user-attachments/assets/cf4f427d-f504-43fd-a10a-b1c1406a0374" />

<img width="1920" height="900" alt="video" src="https://github.com/user-attachments/assets/c64985de-7fca-4bb7-8942-a141e9fdb331" />

<img width="1920" height="900" alt="photo" src="https://github.com/user-attachments/assets/42644013-8193-42e0-aea6-1c4563e6b1fe" />

<img width="1920" height="900" alt="journal" src="https://github.com/user-attachments/assets/0ba932d9-45e5-45c5-839a-c3e1ea1e006b" />

<img width="1920" height="900" alt="Search" src="https://github.com/user-attachments/assets/0e693af0-0780-4eb2-9916-28f073bfb226" />

<img width="1920" height="900" alt="profile" src="https://github.com/user-attachments/assets/40830e79-d2e2-40f7-8639-78b7903dcb94" />

<img width="1920" height="900" alt="video" src="https://github.com/user-attachments/assets/fd7d183d-f820-4922-9f90-ebf1a9f046f4" />

<img width="1920" height="900" alt="photo" src="https://github.com/user-attachments/assets/afd2bb2d-3cf3-474f-b9fb-151aff9f2b35" />

<img width="1920" height="900" alt="journal" src="https://github.com/user-attachments/assets/7bbf67c3-ef86-43a6-be61-ac1184f63c14" />

<img width="1920" height="900" alt="realphoto" src="https://github.com/user-attachments/assets/71f44014-99e3-44f9-bd3b-a276a30ba3cf" />

<img width="1920" height="900" alt="realvideo" src="https://github.com/user-attachments/assets/235eabb4-bc98-45f9-99ed-1aabc11daf98" />

<img width="1920" height="900" alt="realjournal" src="https://github.com/user-attachments/assets/5e46bb33-2008-4d26-af40-e7956016c2ff" />

<img width="1920" height="900" alt="realsearch" src="https://github.com/user-attachments/assets/1e7188b7-27dc-453d-9ff1-0f2b851b70f8" />

<img width="1920" height="900" alt="realdash" src="https://github.com/user-attachments/assets/88ad7824-5ed0-47ed-98e5-82729ec514f3" />

<img width="1920" height="900" alt="recent" src="https://github.com/user-attachments/assets/9889cc0e-b9b4-4064-aacd-956fd41bd216" />

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

