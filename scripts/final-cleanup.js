#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Final cleanup of TypeScript errors...');

// 1. Fix notification system - remove iconBg properties completely
const notificationSystemPath = 'src/components/climb/NotificationSystem.tsx';
if (fs.existsSync(notificationSystemPath)) {
  let content = fs.readFileSync(notificationSystemPath, 'utf8');
  
  // Remove all iconBg lines
  content = content.replace(/\s*iconBg: '[^']*',?\n/g, '');
  
  fs.writeFileSync(notificationSystemPath, content);
  console.log('✅ Fixed notification system iconBg');
}

// 2. Fix recommendation service - cast all priority strings
const recommendationServicePath = 'src/services/recommendationService.ts';
if (fs.existsSync(recommendationServicePath)) {
  let content = fs.readFileSync(recommendationServicePath, 'utf8');
  
  // Fix remaining priority issues by casting arrays
  content = content.replace(/recommendations: suitablePOIs,/g, 'recommendations: suitablePOIs as Recommendation[],');
  content = content.replace(/timeRecommendations\.push\(\.\.\.morningPOIs\);/g, 'timeRecommendations.push(...(morningPOIs as Recommendation[]));');
  content = content.replace(/timeRecommendations\.push\(\.\.\.afternoonPOIs\);/g, 'timeRecommendations.push(...(afternoonPOIs as Recommendation[]));');
  content = content.replace(/timeRecommendations\.push\(\.\.\.eveningPOIs\);/g, 'timeRecommendations.push(...(eveningPOIs as Recommendation[]));');
  content = content.replace(/timeRecommendations\.push\(\.\.\.nightAccommodations\);/g, 'timeRecommendations.push(...(nightAccommodations as Recommendation[]));');
  
  fs.writeFileSync(recommendationServicePath, content);
  console.log('✅ Fixed recommendation service priorities');
}

// 3. Fix integration test - remove invalid props
const integrationTestPath = 'src/test/integration/layout-system.test.tsx';
if (fs.existsSync(integrationTestPath)) {
  let content = fs.readFileSync(integrationTestPath, 'utf8');
  
  // Remove items props that don't exist
  content = content.replace(/items=\{[^}]+\}\s*/g, '');
  
  fs.writeFileSync(integrationTestPath, content);
  console.log('✅ Fixed integration test props');
}

console.log('🎉 Final cleanup completed!');