// File: netlify/functions/go.js

export const handler = async function(event, context) {
  // Debug logging
  console.log('go.js called');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Lấy thời gian hiện tại (dưới dạng milliseconds)
  const creationTime = Date.now();
  console.log('Creation time:', creationTime);

  // Mã hóa thời gian bằng Base64 để URL trông gọn gàng hơn
  const encodedTime = Buffer.from(creationTime.toString()).toString('base64');
  console.log('Encoded time:', encodedTime);

  // Tạo đường dẫn xác thực
  const verificationPath = `/v/${encodedTime}`;
  console.log('Verification path:', verificationPath);

  // Chuyển hướng người dùng đến đường dẫn xác thực
  const response = {
    statusCode: 302,
    headers: {
      "Location": verificationPath,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    },
  };
  
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
};
