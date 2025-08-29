#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Fixing priority type issues...');

const filePath = 'src/services/recommendationService.ts';
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix all priority type assertions
  content = content.replace(/priority: 'medium' as 'medium' as const/g, "priority: 'medium' as const");
  content = content.replace(/priority: 'high' as 'high' as const/g, "priority: 'high' as const");
  content = content.replace(/priority: 'low' as 'low' as const/g, "priority: 'low' as const");
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed priority types in recommendationService.ts');
}

console.log('🎉 Priority type fixes completed!');