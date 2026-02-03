# TaskMaster

**TaskMaster** is an intuitive, full-stack task management application built with **Next.js 15** and **Firebase**. It reimagines the classic to-do app; every CS student eventually builds a "To-Do" app as a rite of passage, and this is my definitive take on that.

## 🛠️ Stack

* **Frontend**: Next.js 15.2.3 (React 18.3.1), TypeScript
* **Styling & UI**: Tailwind CSS 3.4.1, Radix UI, Lucide React
* **Backend & Auth**: Firebase 11.7.0 (Authentication & Firestore)
* **State & Forms**: TanStack Query (v5), React Hook Form, Zod

## 🧱 Architecture Overview

* **`src/context/auth-context.tsx`**: Custom React Context leveraging `onAuthStateChanged` for real-time authentication state management.
* **`src/lib/firebase.ts`**: Centralized Firebase initialization using `NEXT_PUBLIC` environment variables.
* **`src/components/ui`**: Reusable, accessible UI components (Radix-based) including Skeleton loaders, Dialogs, and Toasts.

## 🔐 Authentication Flow

User sessions are tracked in real-time using Firebase Auth. While the authentication status is being resolved, the app renders high-fidelity Skeleton loading states that mirror the dashboard layout to ensure a smooth user experience.

## 📁 Project Structure

* **`/src/app`**: Next.js App Router containing pages (Login, Signup, Dashboard) and Layouts (thanks FB studio).
* **`/src/context`**: Global state providers, specifically the `AuthProvider`.
* **`/src/lib`**: Core utilities, Firebase configuration, and TypeScript type definitions.
* **`/src/components`**: Modular UI components, task-specific logic (TaskCard, TaskList), and layout wrappers.

## 🚀 Getting Started

1. **Install dependencies**
```bash
npm install

```


2. **Configure environment variables**
Create a `.env.local` file and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

```


3. **Run the development server**
```bash
npm run dev

```



The application runs at **[http://localhost:9002](https://www.google.com/search?q=http://localhost:9002)**.
