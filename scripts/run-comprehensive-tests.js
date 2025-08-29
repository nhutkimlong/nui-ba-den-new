#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Comprehensive Test Suite for Responsive UI Upgrade');
console.log('=' .repeat(60));

const testCategories = [
  {
    name: 'Component Tests',
    pattern: 'src/test/components/**/*.test.tsx',
    description: 'Testing individual UI components'
  },
  {
    name: 'Performance Tests', 
    pattern: 'src/test/performance/**/*.test.tsx',
    description: 'Testing performance metrics and optimization'
  },
  {
    name: 'Accessibility Tests',
    pattern: 'src/test/accessibility/**/*.test.tsx', 
    description: 'Testing accessibility compliance and ARIA support'
  },
  {
    name: 'Integration Tests',
    pattern: 'src/test/integration/**/*.test.tsx',
    description: 'Testing component integration and layout systems'
  }
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

async function runTestCategory(category) {
  console.log(`\n📋 ${category.name}`);
  console.log(`   ${category.description}`);
  console.log('-'.repeat(40));
  
  try {
    const output = execSync(`npm run test:run -- "${category.pattern}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Parse test results
    const lines = output.split('\n');
    const testLine = lines.find(line => line.includes('Tests'));
    
    if (testLine) {
      const passedMatch = testLine.match(/(\d+) passed/);
      const failedMatch = testLine.match(/(\d+) failed/);
      
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      totalTests += passed + failed;
      passedTests += passed;
      failedTests += failed;
      
      console.log(`   ✅ ${passed} tests passed`);
      if (failed > 0) {
        console.log(`   ❌ ${failed} tests failed`);
      }
      
      results.push({
        category: category.name,
        passed,
        failed,
        status: failed === 0 ? 'PASS' : 'FAIL'
      });
    }
  } catch (error) {
    console.log(`   ❌ Error running tests: ${error.message}`);
    results.push({
      category: category.name,
      passed: 0,
      failed: 1,
      status: 'ERROR'
    });
    failedTests += 1;
    totalTests += 1;
  }
}

async function runCoverageReport() {
  console.log('\n📊 Generating Coverage Report');
  console.log('-'.repeat(40));
  
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
  } catch (error) {
    console.log('   ⚠️  Coverage report generation failed');
  }
}

async function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0
    },
    categories: results
  };
  
  const reportPath = path.join(__dirname, '..', 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📄 Test Report Generated');
  console.log(`   Report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  const startTime = Date.now();
  
  // Run all test categories
  for (const category of testCategories) {
    await runTestCategory(category);
  }
  
  // Generate coverage report
  await runCoverageReport();
  
  // Generate test report
  const report = await generateTestReport();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
  console.log(`Success Rate: ${report.summary.successRate}%`);
  console.log(`Duration: ${duration}s`);
  
  console.log('\n📋 Category Results:');
  results.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`   ${status} ${result.category}: ${result.passed}/${result.passed + result.failed}`);
  });
  
  // Quality gates
  console.log('\n🎯 Quality Gates:');
  const successRate = parseFloat(report.summary.successRate);
  
  if (successRate >= 90) {
    console.log('   ✅ Success Rate: EXCELLENT (≥90%)');
  } else if (successRate >= 80) {
    console.log('   ⚠️  Success Rate: GOOD (≥80%)');
  } else {
    console.log('   ❌ Success Rate: NEEDS IMPROVEMENT (<80%)');
  }
  
  if (failedTests === 0) {
    console.log('   ✅ All tests passing');
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  } else {
    console.log(`   ❌ ${failedTests} tests failing`);
    console.log('\n⚠️  Some tests failed. Please review and fix.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});