// App Icon Service for optimizing PWA icons and splash screens

export interface IconConfig {
  size: number;
  purpose?: 'any' | 'maskable' | 'monochrome';
  format?: 'png' | 'webp' | 'svg';
  quality?: number;
}

export interface SplashScreenConfig {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

class AppIconService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Generate optimized icons for different sizes
  async generateIcons(baseIcon: string, configs: IconConfig[]): Promise<{ [key: string]: string }> {
    const icons: { [key: string]: string } = {};
    
    // Load base icon
    const img = await this.loadImage(baseIcon);
    
    for (const config of configs) {
      const iconData = await this.generateIcon(img, config);
      const key = `${config.size}x${config.size}${config.purpose ? `-${config.purpose}` : ''}`;
      icons[key] = iconData;
    }
    
    return icons;
  }

  private async generateIcon(img: HTMLImageElement, config: IconConfig): Promise<string> {
    const { size, purpose = 'any', format = 'png', quality = 0.9 } = config;
    
    this.canvas.width = size;
    this.canvas.height = size;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, size, size);
    
    if (purpose === 'maskable') {
      // Add safe area for maskable icons (20% padding)
      const padding = size * 0.1;
      const iconSize = size - (padding * 2);
      
      // Draw background
      this.ctx.fillStyle = '#10b981'; // Primary color
      this.ctx.fillRect(0, 0, size, size);
      
      // Draw icon with padding
      this.ctx.drawImage(img, padding, padding, iconSize, iconSize);
    } else {
      // Regular icon
      this.ctx.drawImage(img, 0, 0, size, size);
    }
    
    // Apply optimizations based on purpose
    if (purpose === 'monochrome') {
      this.applyMonochromeFilter();
    }
    
    // Convert to desired format
    const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
    return this.canvas.toDataURL(mimeType, quality);
  }

  private applyMonochromeFilter(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
      // Alpha remains unchanged
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  // Generate splash screens for different devices
  async generateSplashScreens(
    baseIcon: string, 
    configs: SplashScreenConfig[]
  ): Promise<{ [key: string]: string }> {
    const splashScreens: { [key: string]: string } = {};
    
    const img = await this.loadImage(baseIcon);
    
    for (const config of configs) {
      const splashData = await this.generateSplashScreen(img, config);
      const key = `${config.width}x${config.height}${config.devicePixelRatio > 1 ? `@${config.devicePixelRatio}x` : ''}`;
      splashScreens[key] = splashData;
    }
    
    return splashScreens;
  }

  private async generateSplashScreen(
    img: HTMLImageElement, 
    config: SplashScreenConfig
  ): Promise<string> {
    const { width, height, devicePixelRatio, orientation } = config;
    
    // Set canvas size accounting for device pixel ratio
    const canvasWidth = width * devicePixelRatio;
    const canvasHeight = height * devicePixelRatio;
    
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // Scale context for high DPI
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#f0fdf4'); // primary-50
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#dcfce7'); // primary-100
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    
    // Calculate icon size and position
    const iconSize = Math.min(width, height) * 0.2; // 20% of smaller dimension
    const iconX = (width - iconSize) / 2;
    const iconY = (height - iconSize) / 2;
    
    // Draw icon shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetY = 10;
    
    // Draw icon
    this.ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Add app name
    this.ctx.fillStyle = '#064e3b'; // primary-900
    this.ctx.font = `${Math.min(width, height) * 0.04}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const textY = iconY + iconSize + (Math.min(width, height) * 0.08);
    this.ctx.fillText('Núi Bà Đen', width / 2, textY);
    
    // Add subtitle
    this.ctx.fillStyle = '#6b7280'; // neutral-500
    this.ctx.font = `${Math.min(width, height) * 0.025}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    
    const subtitleY = textY + (Math.min(width, height) * 0.05);
    this.ctx.fillText('Nóc nhà Nam Bộ', width / 2, subtitleY);
    
    return this.canvas.toDataURL('image/png', 0.9);
  }

  // Generate favicon variations
  async generateFavicons(baseIcon: string): Promise<{ [key: string]: string }> {
    const sizes = [16, 32, 48, 64, 96, 128, 192, 512];
    const configs: IconConfig[] = sizes.map(size => ({ size }));
    
    return this.generateIcons(baseIcon, configs);
  }

  // Generate Apple touch icons
  async generateAppleTouchIcons(baseIcon: string): Promise<{ [key: string]: string }> {
    const sizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
    const configs: IconConfig[] = sizes.map(size => ({ size, purpose: 'any' }));
    
    return this.generateIcons(baseIcon, configs);
  }

  // Generate Android icons
  async generateAndroidIcons(baseIcon: string): Promise<{ [key: string]: string }> {
    const configs: IconConfig[] = [
      { size: 36 },   // ldpi
      { size: 48 },   // mdpi
      { size: 72 },   // hdpi
      { size: 96 },   // xhdpi
      { size: 144 },  // xxhdpi
      { size: 192 },  // xxxhdpi
      { size: 192, purpose: 'maskable' },
      { size: 512, purpose: 'maskable' }
    ];
    
    return this.generateIcons(baseIcon, configs);
  }

  // Common device splash screen configurations
  getCommonSplashScreenConfigs(): SplashScreenConfig[] {
    return [
      // iPhone
      { width: 375, height: 667, devicePixelRatio: 2, orientation: 'portrait' }, // iPhone 6/7/8
      { width: 414, height: 736, devicePixelRatio: 3, orientation: 'portrait' }, // iPhone 6/7/8 Plus
      { width: 375, height: 812, devicePixelRatio: 3, orientation: 'portrait' }, // iPhone X/XS
      { width: 414, height: 896, devicePixelRatio: 2, orientation: 'portrait' }, // iPhone XR
      { width: 414, height: 896, devicePixelRatio: 3, orientation: 'portrait' }, // iPhone XS Max
      { width: 390, height: 844, devicePixelRatio: 3, orientation: 'portrait' }, // iPhone 12/13
      { width: 428, height: 926, devicePixelRatio: 3, orientation: 'portrait' }, // iPhone 12/13 Pro Max
      
      // iPad
      { width: 768, height: 1024, devicePixelRatio: 2, orientation: 'portrait' }, // iPad
      { width: 834, height: 1112, devicePixelRatio: 2, orientation: 'portrait' }, // iPad Pro 10.5"
      { width: 1024, height: 1366, devicePixelRatio: 2, orientation: 'portrait' }, // iPad Pro 12.9"
      
      // Android
      { width: 360, height: 640, devicePixelRatio: 2, orientation: 'portrait' }, // Common Android
      { width: 412, height: 732, devicePixelRatio: 2.625, orientation: 'portrait' }, // Pixel
      { width: 360, height: 780, devicePixelRatio: 3, orientation: 'portrait' }, // Galaxy S8+
    ];
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Optimize existing icons
  async optimizeIcon(iconData: string, targetSize: number, quality: number = 0.9): Promise<string> {
    const img = await this.loadImage(iconData);
    return this.generateIcon(img, { size: targetSize, quality });
  }

  // Generate manifest icons from base icon
  async generateManifestIcons(baseIcon: string): Promise<any[]> {
    const configs: IconConfig[] = [
      { size: 72, purpose: 'any' },
      { size: 96, purpose: 'any' },
      { size: 128, purpose: 'any' },
      { size: 144, purpose: 'any' },
      { size: 152, purpose: 'any' },
      { size: 192, purpose: 'any' },
      { size: 384, purpose: 'any' },
      { size: 512, purpose: 'any' },
      { size: 192, purpose: 'maskable' },
      { size: 512, purpose: 'maskable' }
    ];

    const icons = await this.generateIcons(baseIcon, configs);
    
    return Object.entries(icons).map(([key, data]) => {
      const [sizeStr, purpose] = key.split('-');
      const size = parseInt(sizeStr.split('x')[0]);
      
      return {
        src: data,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: purpose || 'any'
      };
    });
  }

  // Check if icon meets PWA requirements
  validateIcon(iconData: string): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const issues: string[] = [];
        const recommendations: string[] = [];
        
        // Check minimum size
        if (img.width < 192 || img.height < 192) {
          issues.push('Icon should be at least 192x192 pixels');
        }
        
        // Check if square
        if (img.width !== img.height) {
          issues.push('Icon should be square (equal width and height)');
        }
        
        // Check if power of 2 for better performance
        const isPowerOf2 = (n: number) => (n & (n - 1)) === 0;
        if (!isPowerOf2(img.width)) {
          recommendations.push('Consider using power-of-2 dimensions for better performance');
        }
        
        // Recommendations
        if (img.width < 512) {
          recommendations.push('Consider providing a 512x512 version for better quality');
        }
        
        resolve({
          isValid: issues.length === 0,
          issues,
          recommendations
        });
      };
      
      img.onerror = () => {
        resolve({
          isValid: false,
          issues: ['Invalid image format'],
          recommendations: ['Use PNG or WebP format']
        });
      };
      
      img.src = iconData;
    });
  }
}

export const appIconService = new AppIconService();
export default appIconService;