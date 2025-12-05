
````markdown
<div align="center">

# 🗨️ Samvaad
### Real-time Chat Application Built with Next.js, Socket.io & PostgreSQL

<div align="center">
  <img src="./client/public/image.png" width="120" alt="Samvaad Logo" />
</div>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black)]()
[![Socket.io](https://img.shields.io/badge/Socket.io-4.0-green)]()
[![Prisma](https://img.shields.io/badge/Prisma-5.0-lightblue)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)]()

</div>

---

## 📌 Overview
**Samvaad** is a modern real-time messaging application supporting 1-1 chats, groups, media sharing, and online presence.  
Built with **Next.js**, **Socket.io**, **Express**, and **PostgreSQL** for speed, security, and scalability.

---

## ✨ Features
- 🔥 Real-time messaging
- 👥 1-1 & group chats
- 🟢 Online/offline & typing indicators
- 📎 Image, file & voice message uploads
- 📨 Message status: Sent / Delivered / Seen
- 📚 Search, pin & archive conversations
- 🔐 JWT authentication
- 🎨 Responsive UI with Tailwind & Framer Motion

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Socket.io Client
- Radix UI + Sonner

### Backend
- Node.js + Express
- Socket.io
- Prisma ORM
- PostgreSQL
- JWT + Bcrypt
- Cloudinary

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Cloudinary account

### Installation
```bash
git clone https://github.com/Kanif-Kumbhar/Samvaad
cd samvaad
````

#### Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

#### Database setup

```bash
cd ../server
npx prisma migrate dev
```

#### Start development

```bash
# Backend
npm run dev

# Frontend
cd ../client
npm run dev
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

```
DATABASE_URL="postgresql://user:pass@localhost:5432/samvaad_db"
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Client (`client/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
```

---

## 📡 Core API Endpoints

| Method | Endpoint                      | Description                 |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/auth/register`              | Register user               |
| POST   | `/auth/login`                 | Login user                  |
| GET    | `/users/search`               | Search users                |
| GET    | `/conversations`              | Fetch conversations         |
| POST   | `/conversations`              | Create conversation         |
| GET    | `/conversations/:id/messages` | Fetch messages              |
| POST   | `/groups`                     | Create group                |
| POST   | `/upload/signature`           | Cloudinary upload signature |

---

## 🔌 Socket Events

### Client → Server

* `message:send`
* `typing`
* `message:seen`
* `message:delete`

### Server → Client

* `message:new`
* `typing`
* `user:status`
* `message:status`

---

## 🗂️ Project Structure

```
samvaad/
 ├── client/        # Next.js frontend
 └── server/        # Express backend + Prisma
```

---

## 🛣️ Roadmap

* [ ] Video calls
* [ ] Audio calls
* [ ] Message reactions
* [ ] Push notifications
* [ ] End-to-end encryption

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📜 License

MIT License

---

<div align="center">
Made with ❤️ — Star ⭐ the repo if you like it!
</div>
```