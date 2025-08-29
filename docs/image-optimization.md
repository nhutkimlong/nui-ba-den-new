# Image Optimization Instructions

## Automatic Optimization

This project includes an image optimization manifest that tracks all images and their required optimized versions.

## Manual Optimization (Recommended)

For production builds, use a proper image optimization tool like Sharp:

```bash
npm install sharp --save-dev
```

Then create optimized versions:

```javascript
import sharp from 'sharp';

// Example optimization
await sharp('input.jpg')
  .resize(1280, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile('output-1280w.webp');
```

## Responsive Images Usage

Use the generated manifest to create responsive images:

```tsx
import imageManifest from '/assets/image-manifest.json';

function ResponsiveImage({ src, alt, className }) {
  const imageData = imageManifest.images[src];
  
  if (!imageData) {
    return <img src={src} alt={alt} className={className} />;
  }

  const webpSources = imageData.optimized
    .filter(img => img.format === 'webp')
    .map(img => `${img.optimized} ${img.size}w`)
    .join(', ');

  const jpgSources = imageData.optimized
    .filter(img => img.format === 'jpg')
    .map(img => `${img.optimized} ${img.size}w`)
    .join(', ');

  return (
    <picture>
      <source srcSet={webpSources} sizes="(max-width: 768px) 100vw, 50vw" type="image/webp" />
      <source srcSet={jpgSources} sizes="(max-width: 768px) 100vw, 50vw" type="image/jpeg" />
      <img src={src} alt={alt} className={className} loading="lazy" />
    </picture>
  );
}
```

## Build Integration

Add to your build process:

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js",
    "prebuild": "npm run optimize:images"
  }
}
```

## Performance Benefits

- **WebP**: 25-35% smaller than JPEG
- **AVIF**: 50% smaller than JPEG (newer browsers)
- **Responsive**: Serve appropriate size for device
- **Lazy Loading**: Load images when needed
- **Progressive**: Show low-quality placeholder first
