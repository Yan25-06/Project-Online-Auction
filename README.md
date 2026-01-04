# Project Online Auction

### First time setup 

1. Clone the repository:

```bash
git clone https://github.com/Yan25-06/Project-Online-Auction.git
cd Project-Online-Auction
```

2. Install dependencies for both backend and frontend:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Running
To run the backend:

```bash
cd backend && npm install && npm run dev
```

To run the frontend:

```bash
cd frontend && npm install && npm run dev
```

---

## Environment variables

The backend requires SMTP environment variables for sending emails. Add the following to your `.env` in `backend`:

- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port (e.g. 587)
- `SMTP_USER` - SMTP username (also used as From address)
- `SMTP_PASS` - SMTP password
- `EMAIL_FROM_NAME` - Optional, friendly "From" display name (defaults to "Sàn Đấu Giá")
- `FRONTEND_URL` - Optional, used to include product links in emails (defaults to `http://localhost:5173`)
 
