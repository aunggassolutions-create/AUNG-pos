const SECRET_KEY = 'AUNG2026SECRET'; // App ထဲက Sync Secret Key နဲ့ တူရပါမယ်

function doGet(e) {
  const reqSecret = (e && e.parameter && e.parameter.secret) || '';
  if (SECRET_KEY && reqSecret !== SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized: Invalid Secret Key' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // ... existing doGet logic ...
}

function doPost(e) {
  const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  if (SECRET_KEY && (payload.secret || '') !== SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized: Invalid Secret Key' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // ... existing doPost logic (use payload.data) ...
}