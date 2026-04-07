#!/usr/bin/env node
/**
 * BizSaathi Backend - Quick Test Script
 * Tests all endpoints after setup
 * Run with: node test-endpoints.js
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  log("========================================", "cyan");
  log("BizSaathi Backend - API Tests", "cyan");
  log("========================================", "cyan");
  log("");

  let passed = 0;
  let failed = 0;

  // Test 1: Guest AI Call
  try {
    log("Test 1: Guest AI Call (WhatsApp Writer)...", "yellow");
    const res = await request("POST", "/api/ai/whatsapp-writer", {
      userInput: "Write a WhatsApp message for my shop",
      language: "en",
    });

    if (res.status === 200 && res.body.output) {
      log(`✓ PASS - Got response: "${res.body.output.substring(0, 50)}..."`, "green");
      passed++;
    } else {
      log(`✗ FAIL - Status: ${res.status}`, "red");
      failed++;
    }
  } catch (error) {
    log(`✗ FAIL - ${error.message}`, "red");
    failed++;
  }

  log("");

  // Test 2: Guest Rate Limiting
  try {
    log("Test 2: Testing Rate Limiting (3 requests should pass, 4th fail)...", "yellow");
    let rateLimitWorking = false;

    for (let i = 1; i <= 4; i++) {
      const res = await request("POST", "/api/ai/poster-maker", {
        userInput: `Request ${i}`,
      });

      if (i === 4 && res.status === 429) {
        log(`✓ Test ${i}: Rate limited (expected 429)`, "green");
        rateLimitWorking = true;
      } else if (i < 4 && res.status === 200) {
        log(`✓ Test ${i}: Allowed`, "green");
      }
    }

    if (rateLimitWorking) {
      log("✓ PASS - Rate limiting working", "green");
      passed++;
    } else {
      log("✗ FAIL - Rate limiting not working as expected", "red");
      failed++;
    }
  } catch (error) {
    log(`✗ FAIL - ${error.message}`, "red");
    failed++;
  }

  log("");

  // Test 3: Signup
  try {
    log("Test 3: Signup...", "yellow");
    const res = await request("POST", "/api/auth/signup", {
      email: `testuser${Date.now()}@example.com`,
      password: "TestPassword123!",
    });

    if (res.status === 201 && res.body.user.id) {
      log(`✓ PASS - User created: ${res.body.user.id.substring(0, 8)}...`, "green");
      global.testUserId = res.body.user.id;
      global.testEmail = res.body.user.email;
      passed++;
    } else {
      log(`✗ FAIL - Status: ${res.status}, Body: ${JSON.stringify(res.body)}`, "red");
      failed++;
    }
  } catch (error) {
    log(`✗ FAIL - ${error.message}`, "red");
    failed++;
  }

  log("");

  // Test 4: Login
  if (global.testEmail) {
    try {
      log("Test 4: Login...", "yellow");
      const res = await request("POST", "/api/auth/login", {
        email: global.testEmail,
        password: "TestPassword123!",
      });

      if (res.status === 200 && res.body.session.access_token) {
        log(`✓ PASS - Login successful`, "green");
        global.accessToken = res.body.session.access_token;
        passed++;
      } else {
        log(`✗ FAIL - Status: ${res.status}`, "red");
        failed++;
      }
    } catch (error) {
      log(`✗ FAIL - ${error.message}`, "red");
      failed++;
    }
  }

  log("");

  // Test 5: Get Credits (with auth)
  if (global.accessToken) {
    try {
      log("Test 5: Get User Credits (Authenticated)...", "yellow");
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${global.accessToken}`,
          "Content-Type": "application/json",
        },
      };

      const url = new URL("/api/user/credits", BASE_URL);
      const res = await new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve({
              status: res.statusCode,
              body: data ? JSON.parse(data) : null,
            });
          });
        });
        req.on("error", reject);
        req.end();
      });

      if (res.status === 200 && res.body.credits_remaining !== undefined) {
        log(
          `✓ PASS - Credits: ${res.body.credits_remaining}, Plan: ${res.body.plan}`,
          "green"
        );
        passed++;
      } else {
        log(`✗ FAIL - Status: ${res.status}`, "red");
        failed++;
      }
    } catch (error) {
      log(`✗ FAIL - ${error.message}`, "red");
      failed++;
    }
  }

  log("");
  log("========================================", "cyan");
  log(`Results: ${passed} passed, ${failed} failed`, passed > failed ? "green" : "red");
  log("========================================", "cyan");
  log("");

  if (failed === 0) {
    log("✓ All tests passed! Backend is working correctly.", "green");
    log("You can now deploy to production.", "green");
  } else {
    log("✗ Some tests failed. Check the errors above.", "red");
    log("Make sure:", "yellow");
    log("  - npm run dev is running", "yellow");
    log("  - API keys are correct in .env.local", "yellow");
    log("  - Supabase database is set up", "yellow");
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, "red");
  process.exit(1);
});
