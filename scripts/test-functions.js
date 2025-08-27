#!/usr/bin/env node

/**
 * Test script for Netlify Functions
 * Run with: node scripts/test-functions.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8888/.netlify/functions';

async function testFunction(functionName, method = 'GET', body = null) {
  const url = `${BASE_URL}/${functionName}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`\n🧪 Testing ${functionName} (${method})...`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data.substring(0, 500)}${data.length > 500 ? '...' : ''}`);
    
    if (response.ok) {
      console.log(`✅ ${functionName} - SUCCESS`);
    } else {
      console.log(`❌ ${functionName} - FAILED`);
    }
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`❌ ${functionName} - ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Netlify Functions Tests...\n');
  
  // Test basic function
  await testFunction('test');
  
  // Test combined-data GET
  await testFunction('combined-data');
  
  // Test data-blobs with different files
  await testFunction('data-blobs?file=POI.json');
  await testFunction('data-blobs?file=Tours.json');
  await testFunction('data-blobs?file=Accommodations.json');
  await testFunction('data-blobs?file=Restaurants.json');
  await testFunction('data-blobs?file=Specialties.json');
  await testFunction('data-blobs?file=GioHoatDong.json');
  
  // Test combined-data POST (create notification)
  await testFunction('combined-data', 'POST', {
    action: 'createNotification',
    data: {
      type: 'announcement',
      title: 'Test Notification',
      message: 'This is a test notification',
      active: true
    }
  });
  
  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error);
