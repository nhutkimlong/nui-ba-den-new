#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Netlify Dev with optimized configuration...');

// Check if netlify CLI is installed
try {
  execSync('netlify --version', { stdio: 'ignore' });
  console.log('✅ Netlify CLI is installed');
} catch (error) {
  console.error('❌ Netlify CLI is not installed. Please install it first:');
  console.error('npm install -g netlify-cli');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(path.dirname(__dirname), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies are installed');
}

// Start Netlify Dev
console.log('🌐 Starting Netlify Dev...');
try {
  execSync('netlify dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start Netlify Dev:', error.message);
  process.exit(1);
}
