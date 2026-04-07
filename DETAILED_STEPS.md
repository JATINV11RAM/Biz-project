# 📖 BizSaathi Backend Setup - DETAILED GUIDE

Complete step-by-step explanation of every action needed to make your backend live.

---

## 🔵 STEP 1: Generate & Add Cron Secret (30 seconds)

### **What is a Cron Secret?**
A cron secret is a **secure password** used to protect your scheduled jobs (daily credit reset). It prevents unauthorized people from running your scheduled tasks.

Think of it like a PIN code for sensitive operations.

---

### **Why do you need it?**
Your app resets user credits every day at midnight automatically. Only authorized systems should trigger this. The cron secret ensures only your system can do this.

---

### **How to generate it:**

**Do exactly this:**

1. **Open PowerShell** (Press: Win + R, type `powershell`, press Enter)

2. **Copy this entire line:**
```powershell
$secret = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Random -Maximum 999999999).ToString())); Write-Host "CRON_SECRET=$secret"
```

3. **Paste into PowerShell** (Right-click → Paste)

4. **Press Enter**

5. **Important**: You'll see output like:
```
CRON_SECRET=MTk4NzY1NDMyMDM=
```

**Copy only the part after `CRON_SECRET=`** (in this example: `MTk4NzY1NDMyMDM=`)

---

### **Where to put it:**

1. Open your project folder in VS Code
2. Find and open file: `.env.local`
3. Find this line:
```
CRON_SECRET=your_random_cron_secret_here
```

4. Replace `your_random_cron_secret_here` with what you copied
5. It should look like:
```
CRON_SECRET=MTk4NzY1NDMyMDM=
```

6. Save the file (Ctrl+S)

✅ **DONE!** You now have a secure cron secret.

---

## 🔵 STEP 2: Create Database Tables (3 minutes)

### **What are database tables?**
Database tables are like Excel spreadsheets in the cloud. They store data:
- **users table** = stores customer information
- **tool_usage table** = stores history of what each user did
- **orders table** = stores payment orders

---

### **Why do you need them?**
Without tables, you have nowhere to save user data when they sign up or use features.

---

### **How to create them:**

### **Part A: Open Supabase SQL Editor**

1. Open browser and go to: **https://vzeblwnzyaatotxvlouy.supabase.co**

2. You'll see Supabase dashboard. On the **left sidebar**, look for this:
   ```
   SQL Editor (with blue icon)
   ```

3. Click **"SQL Editor"**

4. You'll see a blank database query page

---

### **Part B: Copy the Schema SQL**

1. In your project folder, find file: **`supabase-schema.sql`**

2. **Open it** in VS Code

3. **Select All** (Ctrl+A)

4. **Copy** (Ctrl+C)

This is 70+ lines of code that creates your 3 tables.

---

### **Part C: Paste into Supabase**

1. Go back to Supabase SQL Editor (where you had blank page)

2. Click **"New Query"** button (top left, says "+ New Query")

3. You'll get a blank text area in the editor

4. **Paste** your copied SQL (Ctrl+V)

You should now see all the code pasted in there.

---

### **Part D: Execute the SQL**

1. Look for blue **"Run"** button (top right corner)

2. Click **"Run"**

3. **Wait** for 2-3 seconds

4. **You'll see at bottom**: 
```
✓ 1 query executed successfully
```

This means your tables were created! ✅

---

### **Part E: Verify Tables Exist**

1. In left sidebar, click **"Table Editor"** (shows like a grid icon)

2. You'll see a list of tables. Look for:
   - `users` ✅
   - `tool_usage` ✅
   - `orders` ✅

If you see all 3, congratulations! Your database is ready.

---

## 🔵 STEP 3: Enable Email Authentication (1 minute)

### **What is Email Authentication?**
It's a feature that lets users sign up and log in using their email address. Without it, no one can create accounts.

---

### **Why do you need it?**
Currently, Supabase has no login method enabled. You need to turn on "Email" so users can:
1. Signup with email + password
2. Login to get access tokens
3. Use protected endpoints

---

### **How to enable it:**

1. You're still in Supabase dashboard (https://vzeblwnzyaatotxvlouy.supabase.co)

2. On **left sidebar**, find: **"Authentication"** (looks like a person/user icon)

3. Click **"Authentication"**

4. You'll see several tabs. Click **"Providers"** tab

5. You'll see a list of login methods:
   - Email
   - Google
   - GitHub
   - etc.

6. Find **"Email"** in the list

7. Look at the toggle switch on the right side of "Email"
   - It probably shows **OFF** (gray/white)

8. **Click the toggle** to turn it **ON** (it will turn green/blue)

9. A new section might appear with email settings. Just leave them default.

10. Look for **"Save"** button at bottom right of the page

11. Click **"Save"**

✅ **DONE!** Users can now sign up with email.

---

## 🔵 STEP 4: Install Dependencies (3 minutes)

### **What are dependencies?**
Dependencies are pre-built code libraries that your app needs. Think of them like LEGO pieces - you don't make them, you just use them to build your app faster.

Your app needs:
- Next.js (framework)
- Supabase client (to talk to database)
- Gemini AI (for AI features)
- Redis client (for rate limiting)
- And others...

---

### **Why do you need to install them?**
Without dependencies, your code won't run. Node.js won't know what `import GoogleGenerativeAI from "@google/generative-ai"` means.

---

### **How to install them:**

### **Part A: Open PowerShell in Project Folder**

1. Go to your project folder: `c:\Users\Jatin varma\Downloads\biz project`

2. **Open PowerShell here:**
   - Click on address bar in Windows Explorer
   - Type: `powershell`
   - Press Enter

3. PowerShell will open in this folder

---

### **Part B: Run npm install**

1. In PowerShell, type exactly:
```powershell
npm install
```

2. Press **Enter**

3. You'll see output like:
```
up to date, audited 156 packages in 2s
```

Or if first time:
```
added 500 packages in 2m 30s
```

**This takes 2-3 minutes. Be patient.**

---

### **Part C: Verify Installation**

When done, you should see:
```
✓ Your dependencies are installed successfully
```

No red ERROR messages should appear.

If you see errors, check:
- Internet connection working?
- Node.js properly installed? (run `node -v`)
- `.env.local` file exists?

✅ **DONE!** All code libraries are now installed.

---

## 🔵 STEP 5: Start Server & Test (30 seconds setup + 2 min testing)

### **What is the dev server?**
The dev server is a local computer program that runs your backend. It listens for requests and responds like a real server would.

When you run `npm run dev`, your computer becomes a mini web server that runs on `http://localhost:3000`.

---

### **Why do you need it?**
You need to test everything works BEFORE deploying to production. The dev server lets you test locally.

---

### **How to start it:**

### **Part A: Start the Server**

1. Keep PowerShell open (same one from Step 4)

2. Type:
```powershell
npm run dev
```

3. Press **Enter**

4. **Wait 5-10 seconds**

5. You'll see output like:
```
  ▲ Next.js 14.0.0
  
  ✓ Ready in 3.5s
```

And importantly:
```
Local: http://localhost:3000
```

**This means your server is RUNNING!** Keep this PowerShell window OPEN.

---

### **Part B: Test in New PowerShell Window**

1. **Don't close the dev server PowerShell!** 

2. Open a **NEW PowerShell window** (Press Win + R, type `powershell`, press Enter)

3. This new window can be anywhere - it doesn't need to be in project folder

---

### **Test 1: AI Endpoint (Guest User)**

In the NEW PowerShell, type this **exactly**:

```powershell
curl -X POST http://localhost:3000/api/ai/whatsapp-writer `
  -H "Content-Type: application/json" `
  -d '{"userInput":"I sell handmade soaps, write a WhatsApp message","language":"en"}'
```

Press **Enter**.

**What you're doing:**
- Sending a request to your AI endpoint
- Asking it to generate a WhatsApp message
- Testing that Gemini AI is working

**What you should see:**
```json
{
  "output": "Hey! 🧼 Check out our premium handmade soaps...[full message generated by AI]"
}
```

If you see this, **Gemini AI is working!** ✅

**If you see error:**
- Check Gemini API key in `.env.local`
- Check dev server PowerShell for errors
- Try again

---

### **Test 2: User Signup**

Type this:
```powershell
curl -X POST http://localhost:3000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"email":"testuser@example.com","password":"Test123456"}'
```

Press **Enter**.

**What you should see:**
```json
{
  "message": "Signup successful. Please check your email to confirm.",
  "user": {
    "id": "12345-uuid-12345",
    "email": "testuser@example.com"
  }
}
```

**What this means:**
- User created in database
- Supabase sent confirmation email
- Authentication system working ✅

---

### **Test 3: User Login**

Type this:
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"testuser@example.com","password":"Test123456"}'
```

Press **Enter**.

**What you should see:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "12345-uuid-12345",
    "email": "testuser@example.com"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Important:** Copy the entire `access_token` value (the very long string starting with `eyJ...`)

You'll need it for next test.

---

### **Test 4: Check User Credits**

Paste this, but **replace `YOUR_TOKEN` with the access_token you just copied**:

```powershell
curl -X GET http://localhost:3000/api/user/credits `
  -H "Authorization: Bearer YOUR_TOKEN"
```

Press **Enter**.

**What you should see:**
```json
{
  "credits_remaining": 10,
  "plan": "free"
}
```

**What this means:**
- User has 10 free credits
- User is on free plan
- Authentication working ✅
- Credit system working ✅

---

## ✅ ALL TESTS PASS?

If all 4 tests returned good responses, **your backend is 100% working!**

You now have:
✅ Gemini AI generating text
✅ Users signing up
✅ Users logging in
✅ Credit system tracking
✅ Database storing data

---

## 📊 SUMMARY TABLE

| Step | What | Time | Status |
|------|------|------|--------|
| 1 | Generate cron secret | 30 sec | Generate & paste |
| 2 | Create DB tables | 3 min | SQL → Supabase → Run |
| 3 | Enable email auth | 1 min | Toggle on → Save |
| 4 | Install packages | 3 min | npm install |
| 5A | Start dev server | 10 sec | npm run dev |
| 5B | Test AI | 1 min | curl command |
| 5C | Test signup | 1 min | curl command |
| 5D | Test login | 1 min | curl command |
| 5E | Test credits | 1 min | curl command |
| **TOTAL** | | **~14 min** | 100% working |

---

## 🎯 CHECKLIST

After completing all 5 steps, you should have:

- [ ] `.env.local` has CRON_SECRET filled (not placeholder)
- [ ] 3 database tables created in Supabase (users, tool_usage, orders)
- [ ] Email authentication enabled in Supabase
- [ ] `npm install` completed without errors
- [ ] Dev server running (`npm run dev` showing "Ready")
- [ ] Test 1: AI returned generated message
- [ ] Test 2: Signup returned user ID
- [ ] Test 3: Login returned access token
- [ ] Test 4: Credits showed remaining credits

✅ All checked? **Your backend is live!**

---

## 💡 WHAT EACH ENDPOINT DOES

| Endpoint | What it does | Who can use |
|----------|-------------|-----------|
| `/api/ai/whatsapp-writer` | Generates WhatsApp messages | Anyone (guest or authenticated) |
| `/api/auth/signup` | Creates new user account | Anyone |
| `/api/auth/login` | Logs in user, returns token | Anyone with account |
| `/api/user/credits` | Returns remaining credits | Only authenticated users |
| `/api/ai/poster-maker` | Generates social media posters | Anyone (uses credits or rate limit) |
| `/api/ai/profit-advisor` | Suggests profit strategies | Anyone (uses credits or rate limit) |
| `/api/ai/gst-helper` | Explains GST rules | Anyone (uses credits or rate limit) |
| `/api/ai/review-replier` | Generates customer review replies | Anyone (uses credits or rate limit) |
| `/api/user/history` | Returns past tool usage | Only authenticated users |

---

## 🔒 SECURITY NOTES

1. **Keep `.env.local` safe** - Never commit it to GitHub
2. **API Keys are secrets** - Don't share them
3. **Access tokens expire** - Users need to login again after expiry
4. **Passwords are hashed** - Supabase doesn't store plain text
5. **CRON_SECRET protects scheduled jobs** - Only your system can trigger them

---

## 🚀 NEXT (AFTER THESE 5 STEPS)

Once all tests pass:
1. Build frontend that calls these endpoints
2. Deploy to Vercel (free hosting)
3. Add Razorpay when ready for payments
4. Build admin dashboard if needed

---

**Ready? Start with Step 1!** 👆

Any questions? Read the details for that specific step again.
