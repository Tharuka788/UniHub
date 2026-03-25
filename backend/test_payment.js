const fs = require('fs');

async function testUpload() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let data = '';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="userId"\r\n\r\n';
  data += 'user_test_999\r\n';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="amount"\r\n\r\n';
  data += '150.00\r\n';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="paymentFor"\r\n\r\n';
  data += 'Test Payment\r\n';
  
  data += '--' + boundary + '\r\n';
  data += 'Content-Disposition: form-data; name="slipImage"; filename="test.jpg"\r\n';
  data += 'Content-Type: image/jpeg\r\n\r\n';
  data += 'dummy file content\r\n';
  
  data += '--' + boundary + '--\r\n';

  try {
    const res = await fetch('http://localhost:5050/api/payments/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'Bearer mock-jwt-token'
      },
      body: data
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testUpload();
