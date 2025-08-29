#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing remaining TypeScript errors...');

// Fix hooks index.ts exports
const hooksIndexPath = 'src/hooks/index.ts';
if (fs.existsSync(hooksIndexPath)) {
  let content = fs.readFileSync(hooksIndexPath, 'utf8');
  
  // Fix the export line to only export what exists
  content = content.replace(
    /export { useUserPreferences, useTheme, useAccessibility } from '\.\/useUserPreferences'/,
    'export { useUserPreferences } from \'./useUserPreferences\''
  );
  
  fs.writeFileSync(hooksIndexPath, content);
  console.log('✅ Fixed hooks/index.ts exports');
}

// Fix UserPreferences component naming conflict
const userPrefsPath = 'src/components/smart/UserPreferences.tsx';
if (fs.existsSync(userPrefsPath)) {
  let content = fs.readFileSync(userPrefsPath, 'utf8');
  
  // Rename the import to avoid conflict
  content = content.replace(
    /import { UserPreferences } from '@\/services\/recommendationService';/,
    'import { UserPreferences as UserPreferencesType } from \'@/services/recommendationService\';'
  );
  
  // Update usage
  content = content.replace(
    /preferences: UserPreferences/g,
    'preferences: UserPreferencesType'
  );
  
  fs.writeFileSync(userPrefsPath, content);
  console.log('✅ Fixed UserPreferences naming conflict');
}

// Fix useRecommendations hook
const useRecommendationsPath = 'src/hooks/useRecommendations.ts';
if (fs.existsSync(useRecommendationsPath)) {
  let content = fs.readFileSync(useRecommendationsPath, 'utf8');
  
  // Fix the destructuring to match the actual return type
  content = content.replace(
    /const { preferences } = useUserPreferences\(\)/,
    'const [preferences] = useUserPreferences()'
  );
  
  fs.writeFileSync(useRecommendationsPath, content);
  console.log('✅ Fixed useRecommendations hook');
}

// Fix LazyRoute ErrorBoundary fallback
const lazyRoutePath = 'src/components/performance/LazyRoute.tsx';
if (fs.existsSync(lazyRoutePath)) {
  let content = fs.readFileSync(lazyRoutePath, 'utf8');
  
  // Fix the fallback prop to render the component
  content = content.replace(
    /<ErrorBoundary fallback={errorFallback}>/,
    '<ErrorBoundary fallback={<errorFallback error={new Error(\'Loading error\')} retry={() => {}} />}>'
  );
  
  fs.writeFileSync(lazyRoutePath, content);
  console.log('✅ Fixed LazyRoute ErrorBoundary');
}

// Fix voice navigation types
const voiceNavPath = 'src/hooks/useVoiceNavigation.ts';
if (fs.existsSync(voiceNavPath)) {
  let content = fs.readFileSync(voiceNavPath, 'utf8');
  
  // Add type declarations at the top
  const typeDeclarations = `
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
`;
  
  content = typeDeclarations + content;
  
  // Fix the type references
  content = content.replace(/SpeechRecognition/g, 'any');
  content = content.replace(/SpeechRecognitionEvent/g, 'SpeechRecognitionEvent');
  content = content.replace(/SpeechRecognitionErrorEvent/g, 'SpeechRecognitionErrorEvent');
  
  fs.writeFileSync(voiceNavPath, content);
  console.log('✅ Fixed voice navigation types');
}

// Fix PWA service worker sync
const pwaServicePath = 'src/services/pwaService.ts';
if (fs.existsSync(pwaServicePath)) {
  let content = fs.readFileSync(pwaServicePath, 'utf8');
  
  // Fix the sync register call
  content = content.replace(
    /await registration\.sync\.register\('background-sync'\);/,
    'await (registration as any).sync?.register(\'background-sync\');'
  );
  
  fs.writeFileSync(pwaServicePath, content);
  console.log('✅ Fixed PWA service worker sync');
}

// Fix performance memory access
const performanceTestPath = 'src/test/performance/performance.test.tsx';
if (fs.existsSync(performanceTestPath)) {
  let content = fs.readFileSync(performanceTestPath, 'utf8');
  
  // Fix memory access
  content = content.replace(
    /performance\.memory\?\.usedJSHeapSize/g,
    '(performance as any).memory?.usedJSHeapSize'
  );
  
  fs.writeFileSync(performanceTestPath, content);
  console.log('✅ Fixed performance memory access');
}

// Fix test setup scrollTo mock
const testSetupPath = 'src/test/setup.ts';
if (fs.existsSync(testSetupPath)) {
  let content = fs.readFileSync(testSetupPath, 'utf8');
  
  // Fix scrollTo mock
  content = content.replace(
    /window\.scrollTo = vi\.fn\(\);/,
    'window.scrollTo = vi.fn() as any;'
  );
  
  fs.writeFileSync(testSetupPath, content);
  console.log('✅ Fixed test setup scrollTo mock');
}

// Fix LazyImage test props
const lazyImageTestPath = 'src/test/components/performance/LazyImage.test.tsx';
if (fs.existsSync(lazyImageTestPath)) {
  let content = fs.readFileSync(lazyImageTestPath, 'utf8');
  
  // Fix placeholder prop to placeholderSrc
  content = content.replace(/placeholder="/g, 'placeholderSrc="');
  
  // Fix blur prop
  content = content.replace(/blur\s*$/gm, 'blur={true}');
  
  // Fix aspectRatio
  content = content.replace(/aspectRatio="16\/9"/, 'aspectRatio={16/9}');
  
  fs.writeFileSync(lazyImageTestPath, content);
  console.log('✅ Fixed LazyImage test props');
}

console.log('🎉 Additional TypeScript fixes completed!');