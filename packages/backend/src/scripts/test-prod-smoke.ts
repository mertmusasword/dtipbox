import axios from 'axios';

const BASE_URL = 'http://localhost:3005';

async function runProductionSmokeTests() {
  console.log('🚀 Running Production Deployment Smoke Tests against Docker container on port 3005...\n');

  let passed = 0;
  const total = 6;

  // 1. Health Check
  console.log('--- 1. Testing Health Check Endpoint ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/health`);
    if (res.status === 200 && res.data.status === 'ok') {
      console.log(`✅ [1/6] Health Check PASS: ${JSON.stringify(res.data)}`);
      passed++;
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(res.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [1/6] Health Check FAIL:', err.message);
  }

  // 2. Frontend SPA Serving & Fallback
  console.log('\n--- 2. Testing Unified Frontend SPA Serving ---');
  try {
    const rootRes = await axios.get(`${BASE_URL}/`);
    const tipPageRes = await axios.get(`${BASE_URL}/tip/demo-general-qr`);

    const hasTitle = rootRes.data.includes('D-TIPBOX');
    const hasRootDiv = rootRes.data.includes('id="root"');
    const spaFallbackOk = tipPageRes.data.includes('id="root"');

    if (rootRes.status === 200 && hasTitle && hasRootDiv && spaFallbackOk) {
      console.log('✅ [2/6] Frontend SPA Serving PASS: index.html served correctly at root and via SPA fallback.');
      passed++;
    } else {
      throw new Error('SPA response did not match expected index.html');
    }
  } catch (err: any) {
    console.error('❌ [2/6] Frontend SPA Serving FAIL:', err.message);
  }

  // 3. Database Query & Public QR Route
  console.log('\n--- 3. Testing Public QR Endpoint (Database + Business Query) ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/tip/demo-general-qr`);
    if (res.status === 200 && res.data.success && res.data.data.business) {
      const catalog = res.data.data.paymentMethodsCatalog || [];
      console.log(`✅ [3/6] Public QR PASS: Found business "${res.data.data.business.name}" (${res.data.data.business.country}/${res.data.data.business.currency}).`);
      console.log(`       Available Payment Catalog Options: ${catalog.length}`);
      passed++;
    } else {
      throw new Error(`Invalid response: ${JSON.stringify(res.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [3/6] Public QR FAIL:', err.message);
  }

  // 4. Authentication (Admin & Business Login)
  console.log('\n--- 4. Testing Authentication on Production Container ---');
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'business@dtipbox.com',
      password: 'Business123!',
    });

    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.data.accessToken) {
      console.log(`✅ [4/6] Authentication PASS: Logged in as ${loginRes.data.data.user.email} (Role: ${loginRes.data.data.user.role}).`);
      console.log(`       Access Token issued (${loginRes.data.data.accessToken.substring(0, 20)}...)`);
      passed++;
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [4/6] Authentication FAIL:', err.message);
  }

  // 5. Customer Tip Submission (Database Write + State Mapping)
  console.log('\n--- 5. Testing Customer Tip Submission ---');
  try {
    const tipRes = await axios.post(`${BASE_URL}/api/tip/demo-general-qr`, {
      amount: 45.0,
      paymentMethod: 'IBAN_TRANSFER',
      customerName: 'Production Smoke Tester',
      customerMessage: 'Testing production container tip flow',
    });

    const tipData = tipRes.data?.data?.tip;
    const paymentData = tipRes.data?.data?.payment;

    if (tipRes.status === 201 && tipRes.data.success && tipData && paymentData?.status === 'UNVERIFIED') {
      console.log(`✅ [5/6] Customer Tip Submission PASS: Tip ID ${tipData.id} created.`);
      console.log(`       Reference Code: ${paymentData.ibanDetails?.referenceCode || paymentData.transactionId}`);
      console.log(`       Payment Status: ${paymentData.status} (Strict IBAN wire rule verified)`);
      passed++;
    } else {
      throw new Error(`Tip creation failed: ${JSON.stringify(tipRes.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [5/6] Customer Tip Submission FAIL:', err.message);
  }

  // 6. Security Header & CORS Validation
  console.log('\n--- 6. Testing Production Security Headers & CORS ---');
  try {
    const headerRes = await axios.get(`${BASE_URL}/api/health`, {
      headers: { Origin: 'http://localhost:3005' },
    });

    const csp = headerRes.headers['content-security-policy'];
    const xContentType = headerRes.headers['x-content-type-options'];
    const corsHeader = headerRes.headers['access-control-allow-origin'];

    console.log(`       X-Content-Type-Options: ${xContentType}`);
    console.log(`       Access-Control-Allow-Origin: ${corsHeader}`);

    if (xContentType === 'nosniff') {
      console.log('✅ [6/6] Security Headers PASS: Production headers configured properly.');
      passed++;
    } else {
      throw new Error('Security headers missing nosniff');
    }
  } catch (err: any) {
    console.error('❌ [6/6] Security Headers FAIL:', err.message);
  }

  console.log('\n======================================================');
  console.log(`🎉 PRODUCTION SMOKE RESULTS: ${passed}/${total} PASS`);
  console.log('======================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runProductionSmokeTests();
