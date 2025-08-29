#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image Optimization Script
 * Optimizes images for web delivery with multiple formats and sizes
 */

// Configuration
const config = {
  inputDirs: ['src/assets/images', 'public/assets/images', 'assets/images'],
  outputDir: 'public/assets/optimized',
  formats: ['webp', 'avif', 'jpg'],
  sizes: [320, 640, 768, 1024, 1280, 1920],
  quality: {
    webp: 80,
    avif: 70,
    jpg: 85
  }
};

// Image processing functions (using native Node.js for now)
function createOptimizedVersions(imagePath, outputDir) {
  const fileName = path.basename(imagePath, path.extname(imagePath));
  const ext = path.extname(imagePath).toLowerCase();
  
  // For now, we'll create a manifest of images that need optimization
  // In a real implementation, you'd use sharp or similar library
  
  const optimizedVersions = [];
  
  config.formats.forEach(format => {
    config.sizes.forEach(size => {
      const outputFileName = `${fileName}-${size}w.${format}`;
      const outputPath = path.join(outputDir, outputFileName);
      
      optimizedVersions.push({
        original: imagePath,
        optimized: outputPath,
        format,
        size,
        quality: config.quality[format] || 80
      });
    });
  });
  
  return optimizedVersions;
}

function generateResponsiveImageManifest() {
  console.log('🖼️  Generating responsive image manifest...');
  
  const manifest = {
    generated: new Date().toISOString(),
    images: {},
    formats: config.formats,
    sizes: config.sizes,
    quality: config.quality
  };

  // Scan for images
  config.inputDirs.forEach(inputDir => {
    const fullInputDir = path.join(process.cwd(), inputDir);
    
    if (!fs.existsSync(fullInputDir)) {
      console.log(`⚠️  Directory not found: ${inputDir}`);
      return;
    }

    function scanDirectory(dir, relativePath = '') {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath, relativeItemPath);
        } else if (/\.(jpg|jpeg|png|gif|svg)$/i.test(item)) {
          const imageKey = relativeItemPath.replace(/\\/g, '/');
          const optimizedVersions = createOptimizedVersions(itemPath, config.outputDir);
          
          manifest.images[imageKey] = {
            original: {
              path: itemPath,
              size: stat.size,
              lastModified: stat.mtime.toISOString()
            },
            optimized: optimizedVersions
          };
        }
      });
    }

    scanDirectory(fullInputDir);
  });

  // Write manifest
  const manifestPath = path.join(process.cwd(), 'public/assets/image-manifest.json');
  const manifestDir = path.dirname(manifestPath);
  
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Image manifest generated: ${manifestPath}`);
  console.log(`📊 Found ${Object.keys(manifest.images).length} images`);
  
  return manifest;
}

function generateImageOptimizationInstructions() {
  const instructions = `# Image Optimization Instructions

## Automatic Optimization

This project includes an image optimization manifest that tracks all images and their required optimized versions.

## Manual Optimization (Recommended)

For production builds, use a proper image optimization tool like Sharp:

\`\`\`bash
npm install sharp --save-dev
\`\`\`

Then create optimized versions:

\`\`\`javascript
import sharp from 'sharp';

// Example optimization
await sharp('input.jpg')
  .resize(1280, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile('output-1280w.webp');
\`\`\`

## Responsive Images Usage

Use the generated manifest to create responsive images:

\`\`\`tsx
import imageManifest from '/assets/image-manifest.json';

function ResponsiveImage({ src, alt, className }) {
  const imageData = imageManifest.images[src];
  
  if (!imageData) {
    return <img src={src} alt={alt} className={className} />;
  }

  const webpSources = imageData.optimized
    .filter(img => img.format === 'webp')
    .map(img => \`\${img.optimized} \${img.size}w\`)
    .join(', ');

  const jpgSources = imageData.optimized
    .filter(img => img.format === 'jpg')
    .map(img => \`\${img.optimized} \${img.size}w\`)
    .join(', ');

  return (
    <picture>
      <source srcSet={webpSources} sizes="(max-width: 768px) 100vw, 50vw" type="image/webp" />
      <source srcSet={jpgSources} sizes="(max-width: 768px) 100vw, 50vw" type="image/jpeg" />
      <img src={src} alt={alt} className={className} loading="lazy" />
    </picture>
  );
}
\`\`\`

## Build Integration

Add to your build process:

\`\`\`json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js",
    "prebuild": "npm run optimize:images"
  }
}
\`\`\`

## Performance Benefits

- **WebP**: 25-35% smaller than JPEG
- **AVIF**: 50% smaller than JPEG (newer browsers)
- **Responsive**: Serve appropriate size for device
- **Lazy Loading**: Load images when needed
- **Progressive**: Show low-quality placeholder first
`;

  const instructionsPath = path.join(process.cwd(), 'docs/image-optimization.md');
  const docsDir = path.dirname(instructionsPath);
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(instructionsPath, instructions);
  console.log(`📖 Image optimization guide created: ${instructionsPath}`);
}

function optimizeImages() {
  console.log('🚀 Starting image optimization process...');
  
  // Generate manifest
  const manifest = generateResponsiveImageManifest();
  
  // Generate instructions
  generateImageOptimizationInstructions();
  
  // Create output directory
  const outputDir = path.join(process.cwd(), config.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Created output directory: ${config.outputDir}`);
  }

  console.log(`
✅ Image optimization setup complete!

📁 Output directory: ${config.outputDir}
📄 Manifest: public/assets/image-manifest.json
📖 Guide: docs/image-optimization.md

🔧 Next steps:
1. Install Sharp for actual optimization: npm install sharp --save-dev
2. Implement the optimization logic using the manifest
3. Integrate with your build process
4. Use ResponsiveImage component in your app

💡 For production, consider using a service like Cloudinary or ImageKit for automatic optimization.
  `);
}

// Run optimization
optimizeImages();