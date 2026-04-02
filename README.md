# Alrzrii Closet

A production-grade creator portfolio & file release platform built with **React + Vite**, **Firebase**, and **Supabase Storage**.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase) ![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)

---

## Features

- 🔐 **Firebase Auth** — Email/password with persistent sessions
- 📁 **File System** — Upload to Supabase Storage, metadata in Firestore
- ❤️ **Likes** — Real-time like/unlike per file
- 💬 **Comments + Replies** — Nested, real-time comment threads
- 📢 **Dashboard** — Admin announcements with community replies
- 🔎 **Search + Filter** — Search by name/tag, filter by category, sort by date/likes
- 📊 **View counts** — Track file views automatically
- 👑 **Role system** — Admin / User roles stored in Firestore (no hardcoded emails)
- ⚙️ **Admin panel** — Manage users, categories, and hero content
- 🎨 **Dark UI** — Framer Motion animations, Syne + DM Sans typography
- 📦 **Drag & drop upload** — Progress bar, 100MB limit, unique filenames
- 📱 **Fully responsive** — Mobile-first design

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/hamad-alharmi/alrzrii-closet.git
cd alrzrii-closet
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database**
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
5. Copy your config from Project Settings

### 3. Configure Supabase

1. Go to [Supabase](https://supabase.com) → Create project
2. Storage → Create bucket named `closet-files` (set to **public**)
3. Set bucket policy to allow public reads and authenticated uploads
4. Copy Project URL and Anon Key

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_BUCKET=closet-files
```

### 5. Run Locally

```bash
npm run dev
```

---

## Supabase Bucket Policy

In Supabase Dashboard → Storage → `closet-files` → Policies, add:

**Allow public read:**
```sql
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'closet-files');
```

**Allow authenticated upload:**
```sql
CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'closet-files');
```

---

## Making Yourself Admin

1. Register an account at `/auth`
2. In Firebase Console → Firestore → `users` collection
3. Find your document (by UID)
4. Edit `role` field from `"user"` to `"admin"`
5. Refresh the app — Admin panel will appear in navbar

After that, use the Admin Panel UI to promote/demote other users.

---

## Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init (select Hosting, use existing project)
firebase init

# Build & Deploy
npm run build
firebase deploy
```

---

## Database Structure

| Collection | Key Fields |
|---|---|
| `users` | uid, email, role, createdAt |
| `files` | title, description, category, tags, fileURL, fileName, fileSize, filePath, ownerUID, likesCount, viewCount |
| `likes` | userId, fileId |
| `comments` | fileId, authorUID, text |
| `replies` | commentId, authorUID, text |
| `messages` | authorUID, text |
| `messageReplies` | messageId, authorUID, text |
| `categories` | name, color |
| `config/site` | heroTitle, heroSubtitle, heroTagline |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS 3 |
| Animations | Framer Motion |
| State | Zustand |
| Auth + DB | Firebase v10 |
| File Storage | Supabase Storage |
| Routing | React Router v6 |
| UI | Lucide Icons, React Hot Toast |
| Fonts | Syne, DM Sans, JetBrains Mono |

---

Built with care by [alrzrii](https://github.com/hamad-alharmi) — not a school project.
