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

  // Tạo URL thật (có thể là domain khác hoặc cùng domain)
  const realDomain = 'nuibaden.netlify.app'; // Domain thật
  const verificationPath = `/v/${encodedTime}`;
  const realUrl = `https://${realDomain}${verificationPath}`;
  
  // Cách 1: Sử dụng URL rút gọn - KHÔNG cần tạo domain mới
  // is.gd tự động tạo URL ngắn và che giấu domain thật
  const shortenerUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(realUrl)}`;
  
  // Cách 2: Hoặc dùng v.gd (cũng không cần tạo domain)
  // const shortenerUrl = `https://v.gd/create.php?format=simple&url=${encodeURIComponent(realUrl)}`;
  
  // Cách 3: Hoặc dùng tinyurl (cũng không cần tạo domain)
  // const shortenerUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(realUrl)}`;
  
  console.log('Real URL (hidden):', realUrl);
  console.log('Shortener URL:', shortenerUrl);

  // Chuyển hướng người dùng đến URL rút gọn
  const response = {
    statusCode: 302,
    headers: {
      "Location": shortenerUrl,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    },
  };
  
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
};
