#!/usr/bin/env node

/**
 * Script để đồng bộ thư mục assets vào public
 * Chạy script này trước khi build để đảm bảo assets được copy đúng cách
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const assetsDir = join(projectRoot, 'assets');
const publicDir = join(projectRoot, 'public');
const publicAssetsDir = join(publicDir, 'assets');

console.log('🔄 Đồng bộ assets vào thư mục public...');

try {
  // Tạo thư mục public nếu chưa có
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
    console.log('✅ Đã tạo thư mục public/');
  }

  // Tạo thư mục public/assets nếu chưa có
  if (!existsSync(publicAssetsDir)) {
    mkdirSync(publicAssetsDir, { recursive: true });
    console.log('✅ Đã tạo thư mục public/assets/');
  }

  // Copy assets vào public (Windows)
  if (process.platform === 'win32') {
    execSync(`xcopy "${assetsDir}" "${publicAssetsDir}" /E /I /Y`, { stdio: 'inherit' });
  } else {
    // Unix/Linux/Mac
    execSync(`cp -r "${assetsDir}"/* "${publicAssetsDir}/"`, { stdio: 'inherit' });
  }

  console.log('✅ Đã đồng bộ assets thành công!');
  console.log('📁 Assets đã được copy vào public/assets/');
  console.log('🚀 Bây giờ bạn có thể chạy npm run build');

} catch (error) {
  console.error('❌ Lỗi khi đồng bộ assets:', error.message);
  process.exit(1);
}
