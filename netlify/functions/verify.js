// File: netlify/functions/verify.js

// fetch đã có sẵn trong môi trường Netlify Functions (Node.js 18+),
// vì vậy không cần import 'node-fetch'.
import { getStore } from "@netlify/blobs";

// Tên của Blob Store để lưu cấu hình QR
const STORE_NAME = "qr-settings";

// Cấu hình mặc định
const DEFAULT_EXPIRATION_HOURS = 12;
const DEFAULT_TARGET_URL = "https://nuibaden.netlify.app/pages/climb.html"; // Đảm bảo URL này chính xác

export const handler = async function(event, context) {
  try {
    // Debug: Log event details
    console.log('Event path:', event.path);
    console.log('Event rawPath:', event.rawPath);
    console.log('Event pathParameters:', event.pathParameters);
    console.log('Event queryStringParameters:', event.queryStringParameters);
    console.log('Event headers:', event.headers);

    // Lấy cấu hình từ Netlify Blobs (với fallback)
    let settings;
    
    try {
      const store = getStore(STORE_NAME);
      // Tải cấu hình dưới dạng JSON, nếu không có sẽ trả về null
      const settingsData = await store.get("settings", { type: "json" });
      settings = settingsData || {
        expirationHours: DEFAULT_EXPIRATION_HOURS,
        targetUrl: DEFAULT_TARGET_URL
      };
    } catch (blobError) {
      console.error("Lỗi khi lấy cấu hình từ Blob Store:", blobError);
      console.log("Sử dụng cấu hình mặc định");
      // Nếu không lấy được cấu hình, sử dụng giá trị mặc định
      settings = {
        expirationHours: DEFAULT_EXPIRATION_HOURS,
        targetUrl: DEFAULT_TARGET_URL
      };
    }

    console.log('Sử dụng cấu hình QR:', settings);

    // --- LOGIC LẤY MÃ HÓA ĐÃ ĐƯỢC SỬA LẠI ---
    // Logic cũ khá phức tạp. Dựa trên log, đường dẫn request luôn có dạng
    // `/v/CHUOI_MA_HOA`. Logic đơn giản hóa này sẽ ổn định hơn và
    // trích xuất mã một cách trực tiếp.
    let encodedTime = '';
    const path = event.path;

    if (path && path.startsWith('/v/')) {
      // Lấy phần chuỗi nằm sau '/v/'
      encodedTime = path.substring(3);
    }

    console.log('=== DEBUG PARSING ENCODED TIME ===');
    console.log('Path:', path);
    console.log('Encoded time:', encodedTime);
    console.log('=== END DEBUG PARSING ===');

    // Kiểm tra xem đã lấy được mã hóa hay chưa
    if (!encodedTime) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: createErrorPage(
          'URL không hợp lệ',
          'Vui lòng sử dụng đúng đường dẫn QR code được tạo từ hệ thống.',
          '⚠️'
        ),
      };
    }

    // Kiểm tra độ dài và format của encodedTime
    if (encodedTime.length < 10 || encodedTime.length > 50) {
      console.log('Encoded time length invalid:', encodedTime.length);
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: createErrorPage(
          'Mã QR không hợp lệ',
          'Mã QR này có độ dài không đúng. Vui lòng quét lại mã QR chính xác.',
          '🔗'
        ),
      };
    }

    // Kiểm tra format base64 hợp lệ
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(encodedTime)) {
      console.log('Invalid base64 format:', encodedTime);
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: createErrorPage(
          'Mã QR không hợp lệ',
          'Mã QR này có định dạng không đúng. Vui lòng quét lại mã QR chính xác.',
          '🔗'
        ),
      };
    }

    // Giải mã chuỗi base64 để lấy timestamp gốc
    let creationTime;
    try {
      const decodedString = Buffer.from(encodedTime, 'base64').toString('utf8');
      creationTime = parseInt(decodedString, 10);
      if (isNaN(creationTime)) {
        // Lỗi sẽ được bắt ở khối catch bên dưới
        throw new Error('Timestamp sau khi giải mã không phải là một con số.');
      }
    } catch (error) {
      console.error("Lỗi giải mã Base64:", error);
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: createErrorPage(
          'Mã không hợp lệ',
          'Mã QR này không hợp lệ hoặc đã bị hỏng. Vui lòng quét lại mã QR mới.',
          '🔗'
        ),
      };
    }

    // --- KIỂM TRA HẾT HẠN ---
    const expirationTimeMs = settings.expirationHours * 60 * 60 * 1000;
    const currentTime = Date.now();

    if (currentTime - creationTime > expirationTimeMs) {
      // Nếu đã hết hạn, trả về trang lỗi
      return {
        statusCode: 410, // 410 Gone
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: createErrorPage(
            'Đường dẫn đã hết hiệu lực',
            `URL này chỉ có giá trị trong ${settings.expirationHours} giờ. Vui lòng quét lại mã QR để tạo đường dẫn mới.`,
            '⏰'
        ),
      };
    }
    

    // Nếu hợp lệ và chưa hết hạn, tải nội dung của trang đích
    const targetUrl = settings.targetUrl;
    console.log('Đang tải trang đích:', targetUrl);

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Không thể tải trang đích. Status: ${response.status}`);
      }
      const pageContent = await response.text();
      
      // Trả về nội dung của trang đích
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: pageContent,
      };
    } catch (fetchError) {
      console.error('Lỗi khi tải trang đích:', fetchError);
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: createErrorPage(
            'Không thể tải trang',
            'Đã có lỗi xảy ra khi tải nội dung trang đích. Vui lòng thử lại sau.',
            '🌐'
        ),
      };
    }

  } catch (error) {
    console.error('Đã xảy ra lỗi không mong muốn:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: createErrorPage(
          'Lỗi Máy Chủ',
          'Đã có lỗi ngoài ý muốn xảy ra. Vui lòng thử lại sau.',
          '⚙️'
      ),
    };
  }
};

/**
 * Hàm trợ giúp để tạo trang lỗi HTML có giao diện đẹp.
 * @param {string} title - Tiêu đề của trang.
 * @param {string} message - Thông điệp lỗi.
 * @param {string} icon - Biểu tượng emoji.
 * @returns {string} - Chuỗi HTML của trang lỗi.
 */
function createErrorPage(title, message, icon) {
    return `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 40px 20px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              box-sizing: border-box;
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
              font-size: 2.2rem;
              margin-bottom: 20px;
            }
            p {
              font-size: 1.1rem;
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
              font-weight: 600;
            }
            .back-btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">${icon}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="/" class="back-btn">Về trang chủ</a>
          </div>
        </body>
      </html>
    `;
}
