#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Checking and fixing MIME type configurations...');

// Check if _headers file exists and has correct content
const headersPath = path.join(path.dirname(__dirname), '_headers');
const headersContent = `# JavaScript files
*.js
  Content-Type: application/javascript; charset=utf-8

# TypeScript files
*.ts
  Content-Type: application/javascript; charset=utf-8

*.tsx
  Content-Type: application/javascript; charset=utf-8

# Manifest files
*.webmanifest
  Content-Type: application/manifest+json; charset=utf-8

# JSON files
*.json
  Content-Type: application/json; charset=utf-8

# CSS files
*.css
  Content-Type: text/css; charset=utf-8

# HTML files
*.html
  Content-Type: text/html; charset=utf-8`;

if (!fs.existsSync(headersPath) || fs.readFileSync(headersPath, 'utf8') !== headersContent) {
  fs.writeFileSync(headersPath, headersContent);
  console.log('✅ Created/updated _headers file');
} else {
  console.log('✅ _headers file is already correct');
}

// Check netlify.toml configuration
const netlifyPath = path.join(path.dirname(__dirname), 'netlify.toml');
if (fs.existsSync(netlifyPath)) {
  const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');
  
  // Check if MIME type headers are present
  if (!netlifyContent.includes('Content-Type: "application/javascript; charset=utf-8"')) {
    console.log('⚠️  netlify.toml may need MIME type headers. Please check the configuration.');
  } else {
    console.log('✅ netlify.toml has correct MIME type headers');
  }
}

// Check vite.config.ts
const vitePath = path.join(path.dirname(__dirname), 'vite.config.ts');
if (fs.existsSync(vitePath)) {
  const viteContent = fs.readFileSync(vitePath, 'utf8');
  
  if (!viteContent.includes('Content-Type')) {
    console.log('⚠️  vite.config.ts may need server headers configuration.');
  } else {
    console.log('✅ vite.config.ts has server headers configuration');
  }
}

console.log('🎉 MIME type check completed!');
console.log('💡 If you still see MIME type errors, try:');
console.log('   1. Clear browser cache');
console.log('   2. Restart the development server');
console.log('   3. Check if your browser supports ES modules');
