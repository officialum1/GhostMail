# GhostMail

A complete email receiving system built with Next.js 14, NextAuth v5, Prisma, MySQL, and Cloudflare Email Routing.

## Tech Stack
- Next.js 14 (App Router)
- MySQL via Prisma ORM
- NextAuth.js v5 (Auth)
- Cloudflare Email Worker (Webhook)
- Tailwind CSS

## Setup Instructions

1. **Clone repo**
   ```bash
   git clone <repo-url>
   cd ghostmail
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Fill in `.env`:
   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   DOMAIN="yourdomain.com"
   WEBHOOK_SECRET="your-webhook-secret-here"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Dev Server**
   ```bash
   npm run dev
   ```

## Cloudflare Setup (Email Routing)
1. Go to Cloudflare Dashboard → Email Routing → Enable
2. Add MX records to your domain (Cloudflare provides them)
3. Create an Email Worker with the `cloudflare-worker/index.js` code
4. Set Worker env vars: `WEBHOOK_URL`, `WEBHOOK_SECRET`
5. Route all emails (`*@yourdomain.com`) → Email Worker

## Hostinger Deployment
1. Build: `npm run build`
2. Upload via Git or FTP
3. Set Node.js version to 18+
4. Set env variables in Hostinger panel
5. Start command: `npm start`
