# MAP MGT - Content Management Platform

A full-stack web application for managing content inspiration, scripts, and announcements for models. Built with Next.js 15, Prisma, and PostgreSQL.

## Features

- **Role-based Access Control**: Admin and Model roles with strict permission isolation
- **Content Management**: Reels/TikTok inspirations with video, audio, captions, and overlays
- **Script Library**: Organized scripts for ice breakers, upsells, retention, and re-engagement
- **Announcements**: Global or targeted announcements with pinning support
- **Real-time Updates**: Pusher integration for instant content delivery
- **Model Isolation**: Complete privacy between model accounts

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **File Uploads**: UploadThing
- **Real-time**: Pusher
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted like Supabase/Neon)
- Pusher account (for real-time features)
- UploadThing account (for file uploads)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd "model app"
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/map_mgt?schema=public"

   # Auth
   AUTH_SECRET="generate-using-openssl-rand-base64-32"
   AUTH_URL="http://localhost:3000"

   # UploadThing (for file uploads)
   UPLOADTHING_TOKEN=""

   # Pusher (for real-time updates)
   NEXT_PUBLIC_PUSHER_APP_KEY=""
   PUSHER_APP_ID=""
   PUSHER_SECRET=""
   NEXT_PUBLIC_PUSHER_CLUSTER="us2"
   ```

3. **Set up the database**:
   ```bash
   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**: Visit [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding, you can log in with:

**Admin**:
- Email: `admin@mapmgt.com`
- Password: `admin123`

**Sample Models**:
- Email: `maria@mapmgt.com` / `katherine@mapmgt.com` / `sophia@mapmgt.com`
- Password: `model123`

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login)
│   ├── admin/            # Admin dashboard & pages
│   ├── dashboard/        # Model dashboard & pages
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin-specific components
│   ├── model/            # Model-specific components
│   └── ui/               # Reusable UI components
└── lib/
    ├── auth.ts           # NextAuth configuration
    ├── db.ts             # Prisma client
    ├── pusher.ts         # Pusher configuration
    └── utils.ts          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:migrate` - Run database migrations

## Deployment on Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Phase Roadmap

- [x] **Phase 1**: Foundation (Setup, DB, Auth)
- [ ] **Phase 2**: Admin Panel & Model Management
- [ ] **Phase 3**: Content System (Reels, Scripts)
- [ ] **Phase 4**: Announcements
- [ ] **Phase 5**: Model Dashboard & Real-time
- [ ] **Phase 6**: Polish, Security & Deploy

## License

Private - MAP MGT © 2026
