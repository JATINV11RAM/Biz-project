# 🚀 BizSaathi Backend - Ready to Launch

**Status**: ✅ All credentials configured except Razorpay (will add later)

---

## ✅ COMPLETED

```
✅ Gemini API Key
✅ Supabase URL
✅ Supabase Anon Key
✅ Supabase Service Role Key
✅ Upstash Redis
⏳ Razorpay (adding later)
```

---

## 🎯 YOUR NEXT 5 STEPS

### **STEP 1: Generate & Add Cron Secret** (30 seconds)

Open PowerShell and run this **one line**:
```powershell
$secret = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Random -Maximum 999999999).ToString())); Write-Host "CRON_SECRET=$secret"
```

Copy the output (everything after `CRON_SECRET=`)

Open `.env.local` file and replace:
```
CRON_SECRET=your_random_cron_secret_here
```
with:
```
CRON_SECRET=YOUR_COPIED_VALUE
```

Save file.

---

### **STEP 2: Create Database Tables** (3 minutes)

1. Open browser → Go to: https://vzeblwnzyaatotxvlouy.supabase.co
2. Click **SQL Editor** (left sidebar, blue icon)
3. Click **New Query** button
4. **Copy** all text from file: `supabase-schema.sql` in your project folder
5. **Paste** it into Supabase SQL Editor
6. Click **Run** button (blue, top right)
7. Wait for: ✓ Success message

**Done!** Your database tables (users, tool_usage, orders) are now created.

---

### **STEP 3: Enable Email Authentication** (1 minute)

1. In Supabase dashboard, click **Authentication** (left sidebar)
2. Click **Providers** tab
3. Find **Email** in the list
4. Toggle the switch **ON** (it will turn blue/green)
5. Click **Save**

**Done!** Users can now sign up with email.

---

### **STEP 4: Install Dependencies** (3 minutes)

Open PowerShell in your project folder and run:
```powershell
npm install
```

Wait for it to complete (you'll see "added X packages").

---

### **STEP 5: Start Development Server & Test** (2 minutes)

```powershell
npm run dev
```

Wait for this message:
```
✓ Ready in XXX ms
Local: http://localhost:3000
```

---

## 🧪 TEST IT WORKS

Open a **new PowerShell window** (don't close the dev server) and run:

### **Test 1: AI Endpoint (Guest)**
```powershell
curl -X POST http://localhost:3000/api/ai/whatsapp-writer `
  -H "Content-Type: application/json" `
  -d '{"userInput":"I sell handmade soaps, write a WhatsApp message","language":"en"}'
```

You should get back an AI-generated message like:
```json
{
  "output": "Hey! 🧼 Check out our premium handmade soaps... [full message]"
}
```

✅ **If this works, your AI is working!**

---

### **Test 2: Signup**
```powershell
curl -X POST http://localhost:3000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"email":"testuser@example.com","password":"Test123456"}'
```

You should get:
```json
{
  "message": "Signup successful...",
  "user": {
    "id": "some-uuid-here",
    "email": "testuser@example.com"
  }
}
```

✅ **If this works, authentication is working!**

---

### **Test 3: Login**
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"testuser@example.com","password":"Test123456"}'
```

You should get back tokens:
```json
{
  "message": "Login successful",
  "user": {"id": "...", "email": "testuser@example.com"},
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Copy the `access_token` value (the long string)** - you'll need it for next test.

✅ **If this works, login is working!**

---

### **Test 4: Check Credits (Authenticated)**

Replace `YOUR_TOKEN` with the access_token from Test 3:
```powershell
curl -X GET http://localhost:3000/api/user/credits `
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should get:
```json
{
  "credits_remaining": 10,
  "plan": "free"
}
```

✅ **If this works, your backend is 100% working!**

---

## ✅ FINAL CHECKLIST

- [ ] Generated and added CRON_SECRET to `.env.local`
- [ ] Created database tables in Supabase (ran schema SQL)
- [ ] Enabled Email auth in Supabase
- [ ] Ran `npm install` (no errors)
- [ ] Started `npm run dev` (shows "Local: http://localhost:3000")
- [ ] Test 1 passed (AI returned message)
- [ ] Test 2 passed (signup returned user ID)
- [ ] Test 3 passed (login returned access token)
- [ ] Test 4 passed (credits returned)

---

## 📊 VERIFY YOUR `.env.local`

It should now look like this:
```
GEMINI_API_KEY=AIzaSyBkwvrdZg0XqrQM6ThDCeyc3g2xsb-jlcE
SUPABASE_URL=https://vzeblwnzyaatotxvlouy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1tuE4wjbhbMJpKX9-j4rNg_PR1hLg3i
SUPABASE_SERVICE_ROLE_KEY=sb_secret_OKgYbDeCeJ9hGJtVKgojmw_yIsChlfH
UPSTASH_REDIS_REST_URL=https://suited-chamois-93950.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAW7-AAIncDE5NDFjNzk4YzU2OWI0YzhmYmVjMmQwNjQ3NWY3NTE2N3AxOTM5NTA
CRON_SECRET=YOUR_GENERATED_VALUE
RAZORPAY_KEY_ID=WILL_ADD_LATER
RAZORPAY_KEY_SECRET=WILL_ADD_LATER
NEXT_PUBLIC_API_URL=http://localhost:3000
```

✅ **All filled (except Razorpay which you'll add later)**

---

## 🎯 COMMAND SUMMARY

```powershell
# 1. Install
npm install

# 2. Run
npm run dev

# 3. Test (in new PowerShell window)
curl -X POST http://localhost:3000/api/ai/whatsapp-writer `
  -H "Content-Type: application/json" `
  -d '{"userInput":"test","language":"en"}'
```

---

## ⏱️ TIME TO WORKING BACKEND

| Task | Time |
|------|------|
| Cron secret | 1 min |
| Database setup | 3 min |
| Email auth | 1 min |
| npm install | 3 min |
| npm run dev | 1 min |
| Test endpoints | 2 min |
| **TOTAL** | **~11 minutes** |

---

## 💡 COMMANDS YOU'LL USE

```powershell
# Start dev server (from project folder)
npm run dev

# Run tests
node test-endpoints.js

# Build for production
npm run build

# Start production server
npm start

# Open Supabase SQL
# https://vzeblwnzyaatotxvlouy.supabase.co
```

---

## 🚀 READY?

Follow the 5 steps above and you'll have a fully working AI backend in 15 minutes!

**Let me know when you've completed each step and I'll help you troubleshoot if anything goes wrong.**

Next: Run the steps above ↑
