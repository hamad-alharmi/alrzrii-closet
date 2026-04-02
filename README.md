# Alrzrii Closet v2.0

A production-ready portfolio, file sharing, and community platform built with:

- **React + Vite** — fast, modern frontend
- **TailwindCSS** — utility-first dark design system
- **Framer Motion** — smooth page transitions and animations
- **Firebase** (Auth, Firestore, Storage) — full backend
- **Zustand** — lightweight global state

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone https://github.com/hamad-alharmi/alrzrii-closet.git
cd alrzrii-closet
npm install
```

### 2. Set up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Enable **Storage**
6. Copy your config keys

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your Firebase values
```

### 4. Deploy Firestore rules
```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Run locally
```bash
npm run dev
```

---

## 👤 First Admin Setup

After signing up, manually set your user's role to `admin` in Firestore:

1. Open **Firestore Console**
2. Navigate to `users/{your-uid}`
3. Change `role` field from `"user"` to `"admin"`

After that, you can promote/demote other users from the Admin Panel.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # UploadModal, EditFileModal
│   ├── auth/           # ProtectedRoute, AdminRoute
│   ├── comments/       # CommentSection, CommentItem
│   ├── files/          # FileCard, FileGrid, SearchBar, FilterBar, LikeButton
│   ├── layout/         # Navbar
│   └── ui/             # Modal, Spinner, EmptyState, PageTransition, PageLoader
├── lib/
│   ├── firebase.js     # Firebase init
│   ├── formatters.js   # Date, bytes, image helpers
│   └── uuid.js         # Lightweight UUID v4
├── pages/
│   ├── admin/          # AdminPanel, AdminFiles, AdminUsers, AdminCategories, AdminAnnouncements
│   ├── auth/           # LoginPage, SignupPage
│   ├── Community.jsx
│   ├── FileDetail.jsx
│   ├── FilesPage.jsx
│   ├── Home.jsx
│   └── ProfilePage.jsx
├── services/           # All Firestore/Storage operations
└── store/              # Zustand stores (auth, files)
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Auth (login/signup/persistent) | ✅ |
| Role system (admin/user) | ✅ |
| File upload with drag & drop + progress | ✅ |
| Image preview | ✅ |
| Download button | ✅ |
| Like system (no duplicates) | ✅ |
| Real-time comments + nested replies | ✅ |
| Search + category filter + sort | ✅ |
| Community announcements + replies | ✅ |
| Admin: manage files/users/categories/announcements | ✅ |
| User profile page + edit | ✅ |
| View count per file | ✅ |
| Toast notifications | ✅ |
| Dark modern UI, fully responsive | ✅ |
| Framer Motion animations | ✅ |
| Firestore + Storage security rules | ✅ |
| Lazy loading + code splitting | ✅ |

---

## 🚀 Deploy to Vercel

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add all `VITE_FIREBASE_*` environment variables in Vercel project settings
4. Deploy

Vercel auto-deploys on every push to `main`.

---

## 🔒 Security Rules

Rules are in `firestore.rules` and `storage.rules`:

- Only **admins** can write files, categories
- **Authenticated users** can comment, reply, like
- Users can only edit/delete their **own** content
- Admins can moderate all content

---

Built with ♥ for Alrzrii Closet
