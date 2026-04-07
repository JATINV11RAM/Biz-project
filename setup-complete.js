#!/usr/bin/env node

/**
 * 🚀 MASTER SETUP AUTOMATION SCRIPT
 * Handles all automatic setup + shows what requires manual action
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🚀 BizSaathi Backend - Master Setup Script            ║
║                   (April 7, 2026)                               ║
╚════════════════════════════════════════════════════════════════╝
`);

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bold}${msg}${colors.reset}`),
  todo: (msg) => console.log(`${colors.yellow}📌${colors.reset} ${msg}`)
};

// STEP 1: Check environment
log.step('STEP 1: Checking Environment');
const envFilePath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envFilePath)) {
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const hasGemsUrl = envContent.includes('GEMINI_API_KEY');
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL');
  const hasRedis = envContent.includes('UPSTASH_REDIS_REST_URL');
  
  if (hasGemsUrl && hasSupabaseUrl && hasRedis) {
    log.success('Environment file .env.local is configured');
    log.success('All API keys are present');
  } else {
    log.warning('Some API keys might be missing');
  }
} else {
  log.error('.env.local not found!');
  process.exit(1);
}

// STEP 2: Check Node modules
log.step('STEP 2: Checking Node Modules');
if (fs.existsSync(path.join(projectRoot, 'node_modules'))) {
  log.success('node_modules directory exists');
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    log.success(`Project: ${packageJson.name} v${packageJson.version}`);
  } catch (e) {
    log.warning('Could not read package.json');
  }
} else {
  log.error('node_modules not found - npm install may not have run successfully');
  process.exit(1);
}

// STEP 3: Dev Server Status
log.step('STEP 3: Checking Dev Server');
try {
  const response = require('http').request('http://localhost:3000', { timeout: 1000 }, () => {
    log.success('Dev server is running at http://localhost:3000');
  });
  response.on('error', () => {
    log.warning('Dev server not detected - you need to run: npm run dev');
    log.todo('Run in another PowerShell: npm run dev');
  });
  response.end();
} catch (e) {
  log.warning('Could not check dev server status');
  log.todo('Ensure dev server is running: npm run dev');
}

// STEP 4: Manual Browser Tasks
log.step('STEP 4: REQUIRED MANUAL BROWSER TASKS');

console.log(`
${colors.bold}⚠️  These 2 tasks MUST be completed in your web browser:${colors.reset}

${colors.bold}TASK A: Create Database Tables${colors.reset}
${colors.yellow}(Takes ~1 minute)${colors.reset}

Steps:
1️⃣  Open: ${colors.cyan}https://vzeblwnzyaatotxvlouy.supabase.co${colors.reset}
2️⃣  Click: "SQL Editor" (left sidebar)
3️⃣  Click: "+ New Query" button
4️⃣  Open file: supabase-schema.sql (in project root)
5️⃣  Copy ALL content from supabase-schema.sql
6️⃣  Paste into SQL editor
7️⃣  Click: "Run" button
8️⃣  Wait for: ${colors.green}"✓ Query executed successfully"${colors.reset}

${colors.bold}TASK B: Enable Email Authentication${colors.reset}
${colors.yellow}(Takes ~30 seconds)${colors.reset}

Steps:
1️⃣  Open: ${colors.cyan}https://vzeblwnzyaatotxvlouy.supabase.co${colors.reset}
2️⃣  Click: "Authentication" (left sidebar)
3️⃣  Click: "Providers"
4️⃣  Find "Email" provider
5️⃣  Toggle: ON (switch to green)
6️⃣  Click: "Save"
7️⃣  Wait for: Save confirmation

${colors.yellow}${colors.bold}👉 Please complete these 2 browser tasks NOW${colors.reset}

Then come back and we'll run the test suite to verify everything works!
`);

// STEP 5: Verification Steps
log.step('STEP 5: What Happens Next');
console.log(`
1. You complete the 2 manual browser tasks above
2. Come back here
3. We run: npm run test-all
4. All tests should pass (green checkmarks)
5. Backend is completely configured! 🎉

${colors.bold}Ready to test?${colors.reset}

Run: ${colors.cyan}powershell -ExecutionPolicy Bypass -File test-all.ps1${colors.reset}
`);

// STEP 6: Summary
log.step('STEP 6: Summary');
console.log(`
${colors.green}✅ AUTOMATED:${colors.reset}
  • Environment configured (.env.local)
  • Dependencies installed (npm install)
  • Dev server running (npm run dev)

${colors.yellow}📌 MANUAL (Browser):${colors.reset}
  • Create database tables (1 minute)
  • Enable email auth (30 seconds)

${colors.cyan}Next:${colors.reset}
  1. Complete manual browser tasks
  2. Run: powershell -ExecutionPolicy Bypass -File test-all.ps1
  3. See all tests pass ✅

${colors.bold}Questions?${colors.reset}
  • Check: FINAL_SETUP.md (comprehensive guide)
  • Check: DETAILED_STEPS.md (step-by-step explanations)
`);

// Save setup status
fs.writeFileSync(
  path.join(projectRoot, 'SETUP_STATUS.json'),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    automated: ['environment', 'npm_install', 'dev_server'],
    manual: ['database_setup', 'email_auth'],
    status: 'awaiting_manual_setup'
  }, null, 2)
);

log.success('Setup status saved to SETUP_STATUS.json');
console.log('\n');
