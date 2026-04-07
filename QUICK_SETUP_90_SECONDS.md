# ⚡ INSTANT SETUP - Just Copy & Paste (90 seconds)

## 🎯 YOU ARE HERE

Your browser is open to Supabase SQL Editor. We're on the home stretch!

---

## ✅ TASK A: Create Database Tables (1 minute)

### What You See
- Supabase dashboard on the left
- SQL Editor with "New Query" button

### Steps to Follow

**Step 1:** Click `+ New Query` button  
**Step 2:** You'll see a blank SQL editor  
**Step 3:** Copy this SQL (everything below):

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  credits_remaining INT DEFAULT 10,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tool_usage table
CREATE TABLE IF NOT EXISTS tool_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  request TEXT,
  response TEXT,
  credits_used INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'INR',
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_created_at ON tool_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own row" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own row" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for tool_usage table
CREATE POLICY "Users can read own tool_usage" ON tool_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tool_usage" ON tool_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON tool_usage TO authenticated;
GRANT ALL ON orders TO authenticated;
```

**Step 4:** Paste it into the SQL editor  
**Step 5:** Click the blue `Run` button  
**Step 6:** Wait for `✓ Query executed successfully` message  

✅ **DONE WITH TASK A!**

---

## ✅ TASK B: Enable Email Authentication (30 seconds)

### In Same Browser Tab

**Step 1:** Click `Authentication` (left sidebar)  
**Step 2:** Click `Providers`  
**Step 3:** Find `Email` in the list  
**Step 4:** Click the toggle switch to `ON` (it turns green)  
**Step 5:** Click `Save` button  
**Step 6:** Wait for confirmation message  

✅ **DONE WITH TASK B!**

---

## ✅ TASK C: Run Tests (Back in PowerShell)

Come back to PowerShell and run:

```powershell
powershell -ExecutionPolicy Bypass -File test-all.ps1
```

You'll see:
- ✅ 5 automated tests running
- Each test gets a green checkmark
- Final message: "✅ ALL TESTS PASSED!"

---

## 📊 What Gets Created

After these 3 tasks:

| Component | Status |
|-----------|--------|
| Database Tables | ✅ Created |
| Email Auth | ✅ Enabled |
| API Endpoints | ✅ Ready |
| Rate Limiting | ✅ Ready |
| Credit System | ✅ Ready |
| AI Tools | ✅ Ready |

---

## ⏱️ Total Time

- Task A (SQL): ~1 minute
- Task B (Email): ~30 seconds
- Task C (Tests): ~1 minute
- **TOTAL: ~2.5 minutes**

---

## 🎯 After Tests Pass

You'll have:
- ✅ Full backend running
- ✅ All 5 AI tools ready
- ✅ User authentication working
- ✅ Database configured
- ✅ Rate limiting active
- ✅ Credit system tracking

Ready to build your frontend! 🚀

---

**Questions?** Check these files:
- `FINAL_SETUP.md` - Comprehensive guide
- `DETAILED_STEPS.md` - Deep explanations
- `API_REFERENCE.md` - All endpoint documentation
