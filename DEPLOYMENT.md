# 🚀 Deployment Guide - Online Auction Platform

Hướng dẫn deploy project lên production với các nền tảng miễn phí/trả phí.

## 📋 Chuẩn bị trước khi deploy

### 1. Đảm bảo code đã được commit

```bash
git status
git add .
git commit -m "Prepare for deployment"
git push origin master
```

### 2. Kiểm tra các file cấu hình

- ✅ `.gitignore` đã exclude `.env`, `node_modules`
- ✅ `package.json` có script `start` và `build`
- ✅ Environment variables đã được list trong `.env.example`

---

## 🎨 Deploy Frontend (Vercel - Recommended)

### Tại sao chọn Vercel?
- ✅ Miễn phí cho personal projects
- ✅ Tự động deploy khi push to GitHub
- ✅ CDN toàn cầu, tốc độ nhanh
- ✅ Hỗ trợ environment variables
- ✅ HTTPS tự động

### Các bước deploy:

#### Bước 1: Đăng ký Vercel
1. Truy cập https://vercel.com
2. Sign up bằng GitHub account
3. Authorize Vercel truy cập repositories

#### Bước 2: Import Project
1. Click **"Add New Project"**
2. Select repository: `Project-Online-Auction`
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (mặc định)
   - **Output Directory**: `dist` (mặc định)

#### Bước 3: Environment Variables
Thêm các biến môi trường:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-url.com/api
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

**Lưu ý**: Copy từ Supabase Dashboard → Settings → API

#### Bước 4: Deploy
1. Click **"Deploy"**
2. Đợi 1-2 phút
3. Nhận được URL: `https://your-project.vercel.app`

#### Bước 5: Custom Domain (Optional)
1. Settings → Domains
2. Add domain của bạn
3. Config DNS theo hướng dẫn

---

## 🔧 Deploy Backend

### Option 1: Render (Recommended - Free Tier)

#### Tại sao chọn Render?
- ✅ Free tier generous (750 giờ/tháng)
- ✅ Tự động deploy từ GitHub
- ✅ PostgreSQL database miễn phí
- ✅ Environment variables dễ config

#### Các bước:

1. **Tạo Web Service**
   - Truy cập https://render.com
   - New → Web Service
   - Connect GitHub repository

2. **Configure Service**
   ```
   Name: auction-backend
   Region: Singapore (gần Việt Nam nhất)
   Branch: master
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

3. **Environment Variables**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - URL: `https://auction-backend.onrender.com`

5. **Cập nhật Frontend URL**
   - Vào Vercel project settings
   - Update `VITE_API_URL=https://auction-backend.onrender.com/api`
   - Redeploy frontend

**⚠️ Lưu ý Free Tier:**
- Service sleep sau 15 phút không hoạt động
- Request đầu tiên sau khi sleep mất ~1 phút để wake up
- Giải pháp: dùng cron job ping mỗi 10 phút

---

### Option 2: Railway (Alternative)

#### Tại sao chọn Railway?
- ✅ $5 free credit/tháng
- ✅ Không sleep như Render
- ✅ Deploy nhanh hơn

#### Các bước:

1. **Tạo Project**
   - Truy cập https://railway.app
   - New Project → Deploy from GitHub repo
   - Select `Project-Online-Auction`

2. **Configure**
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   - Same as Render
   - Add qua Settings → Variables

4. **Generate Domain**
   - Settings → Generate Domain
   - URL: `https://your-app.up.railway.app`

---

### Option 3: Heroku (Paid)

Nếu cần stability và không bị sleep:

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create auction-backend

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Config root directory
heroku config:set PROJECT_PATH=backend

# Add environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_KEY=your_key
heroku config:set FRONTEND_URL=your_frontend_url

# Deploy
git push heroku master
```

---

## 🗄️ Database (Supabase)

Bạn đã dùng Supabase rồi nên không cần setup thêm!

### Checklist:
- ✅ Row Level Security (RLS) đã enable?
- ✅ API keys đã được bảo mật?
- ✅ Database indexes đã optimize?

---

## 🔐 Security Checklist

### Frontend:
- [ ] VITE_SUPABASE_ANON_KEY chỉ là anon key (not service role)
- [ ] ReCAPTCHA enabled cho forms quan trọng
- [ ] No sensitive data in client-side code

### Backend:
- [ ] SUPABASE_SERVICE_KEY được giữ bí mật
- [ ] CORS chỉ allow frontend domain
- [ ] Rate limiting enabled
- [ ] Input validation trên tất cả endpoints

### Supabase:
- [ ] RLS policies configured đúng
- [ ] Email confirmations enabled
- [ ] OAuth providers configured
- [ ] Database backups scheduled

---

## 📊 Monitoring

### Vercel:
- Analytics tự động
- Real-time logs tại Dashboard

### Render/Railway:
- Logs tab trong dashboard
- Metrics: CPU, Memory, Network

### Supabase:
- Dashboard → Reports
- Monitor database size
- Check slow queries

---

## 🚨 Common Issues & Solutions

### 1. CORS Error
```javascript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 2. Environment Variables không load
- Double check spelling
- Redeploy sau khi thêm env vars
- Check logs xem có warning không

### 3. Backend sleep trên Render
Tạo cron job ping mỗi 10 phút:
```bash
# Dùng cron-job.org hoặc UptimeRobot
GET https://your-backend.onrender.com/health
```

### 4. Build failed
```bash
# Test build locally trước
cd backend
npm run build

cd frontend  
npm run build
```

---

## 🎉 Hoàn thành!

Sau khi deploy xong:

1. **Test toàn bộ features**
   - Login/Register
   - Create product
   - Place bid
   - Payment flow

2. **Share links**
   - Frontend: `https://your-project.vercel.app`
   - Backend: `https://your-backend.onrender.com`

3. **Monitor**
   - Check logs regularly
   - Set up alerts nếu cần
   - Monitor database usage

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trước
2. Google error message
3. Check Vercel/Render documentation
4. Ask on StackOverflow hoặc Discord communities

**Good luck! 🚀**
