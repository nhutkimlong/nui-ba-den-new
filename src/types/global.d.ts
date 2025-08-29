
declare module 'virtual:pwa-register' {
  export function registerSW(options?: any): any;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

export {};
