// File: netlify/functions/go.js

export const handler = async function(event, context) {
  // Lấy thời gian hiện tại (dưới dạng milliseconds)
  const creationTime = Date.now();

  // Mã hóa thời gian bằng Base64 để URL trông gọn gàng hơn
  const encodedTime = Buffer.from(creationTime.toString()).toString('base64');

  // Tạo đường dẫn xác thực
  const verificationPath = `/v/${encodedTime}`;

  // Chuyển hướng người dùng đến đường dẫn xác thực
  return {
    statusCode: 302,
    headers: {
      "Location": verificationPath,
    },
  };
};
