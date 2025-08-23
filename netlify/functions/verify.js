// File: netlify/functions/verify.js
import fetch from 'node-fetch';
import { getStore } from "@netlify/blobs";

// Store name for QR settings
const STORE_NAME = "qr-settings";

// Default settings
const DEFAULT_EXPIRATION_HOURS = 12;
const DEFAULT_TARGET_URL = "https://nuibaden.netlify.app/pages/climb.html";

export const handler = async function(event, context) {
  try {
    // Debug: Log event details
    console.log('Event path:', event.path);
    console.log('Event rawPath:', event.rawPath);
    console.log('Event pathParameters:', event.pathParameters);
    
    // Lấy cài đặt từ Blobs
    const store = getStore(STORE_NAME);
    const settingsData = await store.get("settings");
    const settings = settingsData ? JSON.parse(settingsData) : {
      expirationHours: DEFAULT_EXPIRATION_HOURS,
      targetUrl: DEFAULT_TARGET_URL
    };
    
    console.log('QR Settings:', settings);
    
    // Tính thời gian hết hạn từ cài đặt
    const EXPIRATION_TIME_MS = settings.expirationHours * 60 * 60 * 1000;
    
    // Lấy đoạn mã hóa từ URL - thử nhiều cách
    let encodedTime;
    
    // Thử lấy từ pathParameters trước (Netlify Functions với wildcard)
    if (event.pathParameters && event.pathParameters.proxy) {
      encodedTime = event.pathParameters.proxy;
    } 
    // Thử lấy từ queryStringParameters
    else if (event.queryStringParameters && event.queryStringParameters.t) {
      encodedTime = event.queryStringParameters.t;
    }
    // Thử lấy từ URL path (khi redirect từ /v/*)
    else if (event.path && event.path.includes('/v/')) {
      const pathParts = event.path.split('/');
      const vIndex = pathParts.indexOf('v');
      if (vIndex !== -1 && vIndex + 1 < pathParts.length) {
        encodedTime = pathParts[vIndex + 1];
      }
    }
    // Fallback: split path
    else {
      const pathParts = event.path.split('/');
      encodedTime = pathParts[pathParts.length - 1];
    }
    
    console.log('Encoded time:', encodedTime);
    
    // Kiểm tra xem có encodedTime hợp lệ không
    if (!encodedTime || encodedTime === 'verify') {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html" },
        body: `
          <html>
            <head>
              <title>Lỗi - URL không hợp lệ</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  text-align: center;
                  padding: 50px 20px;
                  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                  color: white;
                  min-height: 100vh;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .container {
                  max-width: 600px;
                  background: rgba(255, 255, 255, 0.1);
                  padding: 40px;
                  border-radius: 20px;
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  font-size: 2.5rem;
                  margin-bottom: 20px;
                  color: #fff;
                }
                p {
                  font-size: 1.2rem;
                  line-height: 1.6;
                  margin-bottom: 30px;
                  opacity: 0.9;
                }
                .icon {
                  font-size: 4rem;
                  margin-bottom: 20px;
                }
                .back-btn {
                  display: inline-block;
                  background: rgba(255, 255, 255, 0.2);
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 25px;
                  transition: all 0.3s ease;
                  border: 2px solid rgba(255, 255, 255, 0.3);
                }
                .back-btn:hover {
                  background: rgba(255, 255, 255, 0.3);
                  transform: translateY(-2px);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⚠️</div>
                <h1>URL không hợp lệ</h1>
                <p>Vui lòng sử dụng đúng đường dẫn QR code được tạo từ hệ thống.</p>
                <a href="/" class="back-btn">Về trang chủ</a>
              </div>
            </body>
          </html>
        `,
      };
    }

    // Giải mã để lấy lại thời gian tạo gốc
    let creationTime;
    try {
      creationTime = parseInt(Buffer.from(encodedTime, 'base64').toString('utf8'));
      if (isNaN(creationTime)) {
        throw new Error('Invalid timestamp');
      }
    } catch (error) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html" },
        body: `
          <html>
            <head>
              <title>Lỗi - Mã thời gian không hợp lệ</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  text-align: center;
                  padding: 50px 20px;
                  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                  color: white;
                  min-height: 100vh;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .container {
                  max-width: 600px;
                  background: rgba(255, 255, 255, 0.1);
                  padding: 40px;
                  border-radius: 20px;
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  font-size: 2.5rem;
                  margin-bottom: 20px;
                  color: #fff;
                }
                p {
                  font-size: 1.2rem;
                  line-height: 1.6;
                  margin-bottom: 30px;
                  opacity: 0.9;
                }
                .icon {
                  font-size: 4rem;
                  margin-bottom: 20px;
                }
                .back-btn {
                  display: inline-block;
                  background: rgba(255, 255, 255, 0.2);
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 25px;
                  transition: all 0.3s ease;
                  border: 2px solid rgba(255, 255, 255, 0.3);
                }
                .back-btn:hover {
                  background: rgba(255, 255, 255, 0.3);
                  transform: translateY(-2px);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⚠️</div>
                <h1>Mã thời gian không hợp lệ</h1>
                <p>Vui lòng quét lại mã QR để tạo đường dẫn mới.</p>
                <a href="/" class="back-btn">Về trang chủ</a>
              </div>
            </body>
          </html>
        `,
      };
    }
    
    const currentTime = Date.now();

    // Kiểm tra xem link có còn hợp lệ hay không
    if (currentTime - creationTime < EXPIRATION_TIME_MS) {
      // Nếu hợp lệ: Lấy nội dung trang gốc và hiển thị
      const targetUrl = settings.targetUrl;
      console.log('Target URL:', targetUrl);
      
      try {
        const response = await fetch(targetUrl);
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const pageContent = await response.text();
        console.log('Page content length:', pageContent.length);

        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: pageContent,
        };
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return {
          statusCode: 500,
          headers: { "Content-Type": "text/html" },
          body: `
            <html>
              <head>
                <title>Lỗi - Không thể tải trang</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    text-align: center;
                    padding: 50px 20px;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    color: white;
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .container {
                    max-width: 600px;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    color: #fff;
                  }
                  p {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    margin-bottom: 30px;
                    opacity: 0.9;
                  }
                  .icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                  }
                  .back-btn {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    transition: all 0.3s ease;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                  }
                  .back-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">🌐</div>
                  <h1>Không thể tải trang</h1>
                  <p>Không thể tải nội dung từ trang đích. Vui lòng thử lại sau.</p>
                  <a href="/" class="back-btn">Về trang chủ</a>
                </div>
              </body>
            </html>
          `,
        };
      }
    } else {
      // Nếu đã hết hạn: Trả về trang thông báo lỗi
      return {
        statusCode: 410, // 410 Gone - tài nguyên đã bị xóa vĩnh viễn
        headers: { "Content-Type": "text/html" },
        body: `
          <html>
            <head>
              <title>Hết hiệu lực</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  text-align: center;
                  padding: 50px 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  min-height: 100vh;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .container {
                  max-width: 600px;
                  background: rgba(255, 255, 255, 0.1);
                  padding: 40px;
                  border-radius: 20px;
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  font-size: 2.5rem;
                  margin-bottom: 20px;
                  color: #fff;
                }
                p {
                  font-size: 1.2rem;
                  line-height: 1.6;
                  margin-bottom: 30px;
                  opacity: 0.9;
                }
                .icon {
                  font-size: 4rem;
                  margin-bottom: 20px;
                }
                .back-btn {
                  display: inline-block;
                  background: rgba(255, 255, 255, 0.2);
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 25px;
                  transition: all 0.3s ease;
                  border: 2px solid rgba(255, 255, 255, 0.3);
                }
                .back-btn:hover {
                  background: rgba(255, 255, 255, 0.3);
                  transform: translateY(-2px);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⏰</div>
                <h1>Rất tiếc, đường dẫn này đã hết hiệu lực</h1>
                <p>URL này chỉ có giá trị trong 12 giờ kể từ lúc được tạo. Vui lòng quét lại mã QR để tạo đường dẫn mới.</p>
                <a href="/" class="back-btn">Về trang chủ</a>
              </div>
            </body>
          </html>
        `,
      };
    }
  } catch (error) {
    // Xử lý nếu URL không hợp lệ
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html" },
      body: `
        <html>
          <head>
            <title>Lỗi</title>
            <meta charset="utf-8">
            <style>
              body {
                font-family: sans-serif;
                text-align: center;
                padding: 50px;
                background: #f5f5f5;
              }
              .error {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>URL không hợp lệ</h1>
              <p>Đường dẫn bạn truy cập không đúng định dạng.</p>
            </div>
          </body>
        </html>
      `
    };
  }
};
