const https = require('https');
const http = require('http');

// Test function
async function testFunction(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Making request:', method, url);
    console.log('Options:', JSON.stringify(options, null, 2));

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      const bodyString = JSON.stringify(body);
      console.log('Sending body:', bodyString);
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
      req.write(bodyString);
    }
    req.end();
  });
}

// Test functions
async function runTests() {
  console.log('Testing Netlify Functions...\n');

  try {
    // Test 1: GET data-blobs
    console.log('1. Testing GET data-blobs...');
    const result1 = await testFunction('http://localhost:8888/.netlify/functions/data-blobs?file=POI.json');
    console.log('Status:', result1.statusCode);
    console.log('Response:', result1.body.substring(0, 200) + '...');
    console.log('');

    // Test 1b: POST test function
    console.log('1b. Testing POST test function...');
    const result1b = await testFunction(
      'http://localhost:8888/.netlify/functions/test',
      'POST',
      { test: 'data' }
    );
    console.log('Status:', result1b.statusCode);
    console.log('Response:', result1b.body);
    console.log('');

    // Test 2: POST auth
    console.log('2. Testing POST auth...');
    const result2 = await testFunction(
      'http://localhost:8888/.netlify/functions/auth',
      'POST',
      { password: 'password', action: 'login' }
    );
    console.log('Status:', result2.statusCode);
    console.log('Response:', result2.body);
    console.log('');

    // Test 2b: POST auth with wrong password
    console.log('2b. Testing POST auth with wrong password...');
    const result2b = await testFunction(
      'http://localhost:8888/.netlify/functions/auth',
      'POST',
      { password: 'wrong', action: 'login' }
    );
    console.log('Status:', result2b.statusCode);
    console.log('Response:', result2b.body);
    console.log('');

    // Test 3: GET combined-data
    console.log('3. Testing GET combined-data...');
    const result3 = await testFunction('http://localhost:8888/.netlify/functions/combined-data');
    console.log('Status:', result3.statusCode);
    console.log('Response:', result3.body.substring(0, 200) + '...');
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

runTests();
