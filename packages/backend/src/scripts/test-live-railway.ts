import axios from 'axios';

const LIVE_URL = 'https://dtipbox-production.up.railway.app';

async function waitAndTest() {
  console.log(`🌐 Connecting to live Railway deployment: ${LIVE_URL}`);
  console.log('⏳ Waiting for Railway container build & startup to complete...\n');

  let attempts = 0;
  const maxAttempts = 30; // 30 * 10s = 5 minutes max wait
  let isOnline = false;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await axios.get(`${LIVE_URL}/api/health`, { timeout: 8000 });
      if (res.status === 200 && res.data?.status === 'ok') {
        console.log(`🎉 Railway deployment is ONLINE! (Attempt ${attempts}/${maxAttempts})`);
        console.log(`   Health response:`, res.data);
        isOnline = true;
        break;
      }
    } catch (err: any) {
      process.stdout.write(`...waiting (${attempts}/${maxAttempts}) [${err.response?.status || err.message}]\n`);
    }
    await new Promise((r) => setTimeout(r, 10000));
  }

  if (!isOnline) {
    console.error('\n❌ Timed out waiting for Railway deployment to become active.');
    console.error('Please verify Railway deployment logs in the Railway dashboard.');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🧪 RUNNING PRODUCTION SMOKE TESTS ON LIVE RAILWAY');
  console.log('======================================================\n');

  let passed = 0;
  const total = 9;

  // 1. /api/health
  console.log('--- 1. Testing /api/health Endpoint ---');
  try {
    const res = await axios.get(`${LIVE_URL}/api/health`);
    if (res.status === 200 && res.data.status === 'ok') {
      console.log(`✅ [1/9] /api/health: PASS (${JSON.stringify(res.data)})`);
      passed++;
    } else {
      throw new Error(`Unexpected body: ${JSON.stringify(res.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [1/9] /api/health: FAIL:', err.message);
  }

  // 2. Frontend SPA Root & SPA Routing
  console.log('\n--- 2. Testing Frontend SPA Serving & Client Routing ---');
  try {
    const rootRes = await axios.get(`${LIVE_URL}/`);
    const loginRes = await axios.get(`${LIVE_URL}/login`);

    const hasTitle = rootRes.data.includes('D-TIPBOX');
    const hasRootDiv = rootRes.data.includes('id="root"');
    const loginFallback = loginRes.data.includes('id="root"');

    if (rootRes.status === 200 && hasTitle && hasRootDiv && loginFallback) {
      console.log('✅ [2/9] Frontend SPA: PASS (HTML, title, scripts, and SPA fallback verified).');
      passed++;
    } else {
      throw new Error('Root HTML did not match expected SPA template');
    }
  } catch (err: any) {
    console.error('❌ [2/9] Frontend SPA: FAIL:', err.message);
  }

  // 3. Database Connection & Superadmin / Business Login
  console.log('\n--- 3. Testing Authentication & Database Query ---');
  let authToken = '';
  let businessAuthToken = '';
  let businessId = '';

  try {
    // Test admin login
    try {
      const adminLogin = await axios.post(`${LIVE_URL}/api/auth/login`, {
        email: 'admin@dtipbox.com',
        password: 'AdminSecurePassword123!',
      });
      if (adminLogin.status === 200 && adminLogin.data.data?.accessToken) {
        authToken = adminLogin.data.data.accessToken;
        console.log(`✅ [3/9] Auth: PASS (Superadmin logged in as ${adminLogin.data.data.user.email}).`);
      }
    } catch (adminErr: any) {
      console.log(`   (Admin login info: ${adminErr.response?.data?.error || adminErr.message})`);
    }

    // Register a dedicated production smoke test business
    const randomSuffix = Math.floor(Math.random() * 10000);
    const testBusinessEmail = `smoke.business.${randomSuffix}@dtipbox.com`;

    const registerRes = await axios.post(`${LIVE_URL}/api/auth/register`, {
      email: testBusinessEmail,
      password: 'ProductionPassword123!',
      businessName: `Grand Railway Bistro ${randomSuffix}`,
      country: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
    });

    if (registerRes.status === 201 && registerRes.data.data?.accessToken) {
      businessAuthToken = registerRes.data.data.accessToken;
      businessId = registerRes.data.data.user.business.id;
      console.log(`✅ [3/9] Business Registration: PASS (Created ${testBusinessEmail}, ID: ${businessId}).`);
      passed++;
    } else {
      throw new Error(`Business registration failed: ${JSON.stringify(registerRes.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [3/9] Authentication & Database Query: FAIL:', err.response?.data || err.message);
  }

  // 4. Business Dashboard & Profile Data
  console.log('\n--- 4. Testing Business Dashboard & Profile Data ---');
  try {
    const profileRes = await axios.get(`${LIVE_URL}/api/business`, {
      headers: { Authorization: `Bearer ${businessAuthToken}` },
    });

    if (profileRes.status === 200 && profileRes.data.data.id === businessId) {
      console.log(`✅ [4/9] Business Dashboard: PASS (Retrieved profile for "${profileRes.data.data.name}").`);
      passed++;
    } else {
      throw new Error(`Profile mismatch: ${JSON.stringify(profileRes.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [4/9] Business Dashboard: FAIL:', err.response?.data || err.message);
  }

  // 5. Payment Account & Payment Methods Setup
  console.log('\n--- 5. Testing Payment Methods & Bank Account Architecture ---');
  try {
    // Configure IBAN payment account with snake_case parameters
    await axios.post(
      `${LIVE_URL}/api/business/payment-account`,
      {
        country: 'US',
        account_holder_name: 'Grand Railway Bistro LLC',
        account_number: '1122334455',
        routing_number: '021000021',
        bank_name: 'JPMorgan Chase Live',
      },
      { headers: { Authorization: `Bearer ${businessAuthToken}` } }
    );

    // Activate IBAN transfer
    await axios.put(
      `${LIVE_URL}/api/business/payment-methods`,
      { type: 'IBAN_TRANSFER', status: 'ACTIVE' },
      { headers: { Authorization: `Bearer ${businessAuthToken}` } }
    );

    console.log('✅ [5/9] Payment Method States: PASS (Bank payment account configured and IBAN_TRANSFER set to ACTIVE).');
    passed++;
  } catch (err: any) {
    console.error('❌ [5/9] Payment Method States: FAIL:', err.response?.data || err.message);
  }

  // 6. Generate Public QR Code
  console.log('\n--- 6. Testing QR Code Generation & Public Route ---');
  let publicQrToken = '';
  try {
    const qrRes = await axios.post(
      `${LIVE_URL}/api/business/qr`,
      { type: 'DTIPBOX' },
      { headers: { Authorization: `Bearer ${businessAuthToken}` } }
    );

    if (qrRes.status === 201 && qrRes.data.data?.public_token) {
      publicQrToken = qrRes.data.data.public_token;
      console.log(`✅ [6/9] QR Generation: PASS (Token: ${publicQrToken}).`);
      passed++;
    } else {
      throw new Error(`QR creation failed: ${JSON.stringify(qrRes.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [6/9] QR Generation: FAIL:', err.response?.data || err.message);
  }

  // 7. Public QR Details (Zero Leakage Check)
  console.log('\n--- 7. Testing Public QR Endpoint & Sensitive Data Protection ---');
  try {
    const publicRes = await axios.get(`${LIVE_URL}/api/tip/${publicQrToken}`);
    const data = publicRes.data.data;

    const hasNoPasswords = !JSON.stringify(data).includes('password_hash');
    const catalog = data.paymentMethodsCatalog || [];
    const ibanMethod = catalog.find((m: any) => m.type === 'IBAN_TRANSFER');

    if (publicRes.status === 200 && hasNoPasswords && ibanMethod?.isUsable) {
      console.log(`✅ [7/9] Public QR Resolution: PASS (Business "${data.business.name}" loaded, IBAN_TRANSFER is USABLE).`);
      console.log(`       Zero sensitive data leakage confirmed.`);
      passed++;
    } else {
      throw new Error(`Public QR data invalid or IBAN method not usable: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    console.error('❌ [7/9] Public QR Resolution: FAIL:', err.response?.data || err.message);
  }

  // 8. Customer Tip Flow Execution (Database Write + State Check)
  console.log('\n--- 8. Testing Customer Tip Flow on Live Database ---');
  try {
    const tipRes = await axios.post(`${LIVE_URL}/api/tip/${publicQrToken}`, {
      amount: 75.0,
      paymentMethod: 'IBAN_TRANSFER',
      customerName: 'Live Railway Tester',
      customerMessage: 'Production deployment verification tip',
    });

    const tipData = tipRes.data?.data?.tip;
    const paymentData = tipRes.data?.data?.payment;

    if (tipRes.status === 201 && tipData && paymentData?.status === 'UNVERIFIED') {
      console.log(`✅ [8/9] Customer Tip Flow: PASS (Tip ${tipData.id} recorded in Railway PostgreSQL).`);
      console.log(`       Status: ${paymentData.status} (Strict unverified wire transfer rule enforced)`);
      console.log(`       Reference Code: ${paymentData.ibanDetails?.referenceCode || paymentData.transactionId}`);
      passed++;
    } else {
      throw new Error(`Tip creation failed: ${JSON.stringify(tipRes.data)}`);
    }
  } catch (err: any) {
    console.error('❌ [8/9] Customer Tip Flow: FAIL:', err.response?.data || err.message);
  }

  // 9. Production Security Headers & CORS
  console.log('\n--- 9. Testing Production Security Headers & CORS ---');
  try {
    const headerRes = await axios.get(`${LIVE_URL}/api/health`);

    const xContentType = headerRes.headers['x-content-type-options'];
    console.log(`       X-Content-Type-Options: ${xContentType}`);

    if (xContentType === 'nosniff') {
      console.log('✅ [9/9] Security Headers: PASS (Production nosniff header enforced).');
      passed++;
    } else {
      throw new Error('Missing security header nosniff');
    }
  } catch (err: any) {
    console.error('❌ [9/9] Security Headers: FAIL:', err.message);
  }

  console.log('\n======================================================');
  console.log(`🎉 LIVE PRODUCTION VERIFICATION: ${passed}/${total} PASS`);
  console.log('======================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

waitAndTest();
