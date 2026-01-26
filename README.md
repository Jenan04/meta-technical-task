# ShareSpace

## 📖 Project Overview
**ShareSpace** is a Full-Stack application that allows users to upload files and text and display them on a **private profile**.  
Users start from a landing page, create a **pseudo-user** without signing up, and can upload content that is only visible on their own profile.  
The platform is designed to be **private per user**, without sharing content between users.

---

## 🚀 Features
- Create a **pseudo-user** without traditional authentication or sign-up.  
- Upload files, images, and text for each user.  
- Display content on a **private profile page**.  
- Fully integrated **Full-Stack** architecture: Frontend + Backend + Database + Services.  
- Unit testing for core business logic using **Jest**.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS  
- **Backend:** GraphQL API using `@graphql-yoga/node` + `graphql`  
- **Database & ORM:** Prisma + SQLite (file-based, no manual setup required)  
- **Testing:** Jest + ts-jest  

---

## 📂 Project Structure
```
ShareSpace/
│
├── .next/ # Next.js build output
├── node_modules/ # Installed dependencies
├── prisma/ # Prisma ORM schema & migrations
├── public/ # Public assets (images, favicon, etc.)
├── src/
│ ├── app/ # Next.js App Router pages & layouts
│ │ ├── api/ # Backend API routes
│ │ ├── component/ # Reusable UI components
│ │ └── layout.tsx # Root layout
│ │
│ ├── graphql/ # GraphQL queries & mutations(resolvers and schema)
│ ├── lib/ # Utility files (e.g., prisma.ts)
│ ├── services/ # Service layer (e.g., authService)
│ └── types/ # TypeScript types
│
├── public/ # Static assets
│ └── favicon.webp
│
├── .env.example # Example environment variables
├── eslint.config.mjs # ESLint configuration
├── next-env.d.ts # Next.js TypeScript env types
├── globals.css # Global styles
└── prisma.config.ts # Prisma configuration
```
---

## ⚙️ Installation & Setup
1. **Clone the repository**
```bash
git clone <repo_url>
cd sharespace
```
2. Install dependencies:
```
npm install
```
3. Run Prisma migrations:
```
npx prisma migrate dev
```
4. Start development server:
```
npm run dev
```