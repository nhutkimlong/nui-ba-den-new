// Script để thiết lập cài đặt QR mặc định
const defaultQrSettings = {
  expirationHours: 12,
  targetUrl: "https://nuibaden.netlify.app/pages/climb.html",
  lastUpdated: new Date().toISOString()
};

console.log('Thiết lập cài đặt QR mặc định:', defaultQrSettings);

// Gọi API để thiết lập
fetch('https://nuibaden.netlify.app/.netlify/functions/combined-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'updateQrSettings',
    data: {
      expirationHours: defaultQrSettings.expirationHours,
      targetUrl: defaultQrSettings.targetUrl
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('Kết quả:', data);
})
.catch(error => {
  console.error('Lỗi:', error);
});
