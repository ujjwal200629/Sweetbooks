# Cloudflare Tunnel Local Demo Setup

This guide explains how to expose your locally running Sweetbook application to clients securely over the internet using Cloudflare Tunnel.

With this setup, you only need to share a single public URL with your client. The Vite proxy handles routing the `/api` requests to your local Express backend, bypassing CORS issues entirely.

## 1. Prerequisites
- Download and install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
- Ensure your Sweetbook project is running locally.

## 2. Environment Configuration
Ensure your local `.env` files are configured for development:

**`frontend/.env`**
```env
VITE_API_URL=/api
```
*(This ensures frontend requests go through the Vite proxy instead of hardcoding localhost).*

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/sweetbook
JWT_SECRET=your_secret_key
```

## 3. Start the Application
Open two separate terminals in your project root:

**Terminal 1 (Backend)**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```
*Your frontend is now running on `http://localhost:5173` and proxying API requests to `http://localhost:5000`.*

## 4. Run Cloudflare Tunnel
Open a third terminal and run the following command to create a secure, temporary public tunnel to your frontend:

```bash
cloudflared tunnel --url http://localhost:5173
```

Cloudflare will generate a public URL that looks like this:
`https://random-words-here.trycloudflare.com`

## 5. Share with Client
Copy the `trycloudflare.com` URL and send it to your client. 
They can now browse the application fully functional, login with the demo account, and view the dashboard. All API requests automatically resolve through the tunnel into your Vite proxy, and then into your Express backend.

## Common Troubleshooting
- **API requests returning 404**: Ensure the backend is running on port 5000 and that you didn't accidentally stop the Vite dev server.
- **Login fails**: Ensure your local PostgreSQL database is running and has been seeded (`npm run seed`).
- **Cannot connect to tunnel**: If the tunnel drops, restart the `cloudflared` command and a new URL will be generated.
