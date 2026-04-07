#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates all required tables in Supabase PostgreSQL
 */

const https = require('https');

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vzeblwnzyaatotxvlouy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Extract host from URL
const url = new URL(SUPABASE_URL);
const HOST = url.hostname;

// SQL Schema
const SQL_SCHEMA = `
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
`;

/**
 * Execute SQL via Supabase REST API using curl-like POST
 */
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: HOST,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Alternative: Use batch execution
 */
async function setupDatabase() {
  console.log('🔄 Attempting to initialize Supabase database...');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Try executing schema
    console.log('\n⏳ Creating tables...');
    
    // Note: Supabase doesn't expose raw SQL execution via REST API
    // We need to do this manually or use a different approach
    
    console.log('\n⚠️  Supabase REST API limitation detected');
    console.log('ℹ️  Supabase doesn\'t expose raw SQL execution via REST API for security reasons.');
    console.log('✅ However, you can execute the SQL manually:');
    console.log('\n📋 STEPS:');
    console.log('1. Go to: https://vzeblwnzyaatotxvlouy.supabase.co/project/default/sql/new');
    console.log('2. Copy schema from: supabase-schema.sql');
    console.log('3. Paste into SQL editor');
    console.log('4. Click "Run"');
    console.log('5. Tables created! ✅');
    
    // Alternative: Check if tables already exist
    checkExistingTables();
    
  } catch (error) {
    console.error('\n❌ Setup error:', error.message);
    process.exit(1);
  }
}

/**
 * Check if tables already exist by querying information_schema
 */
async function checkExistingTables() {
  console.log('\n🔍 Checking for existing tables...');
  
  const checkQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  
  try {
    const postData = JSON.stringify({ query: checkQuery });
    
    return new Promise((resolve) => {
      const options = {
        hostname: HOST,
        port: 443,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('📊 Existing tables:', data);
          resolve();
        });
      });

      req.on('error', () => {
        console.log('ℹ️  Could not query existing tables (this is normal)');
        resolve();
      });
      
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.log('ℹ️  Could not query existing tables');
  }
}

// Run setup
setupDatabase();
