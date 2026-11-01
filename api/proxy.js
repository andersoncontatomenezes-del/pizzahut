export default function handler(req, res) {
  // Dentro do handler, antes do fetch do Telegram
const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
const exactTime = new Date().toISOString();
  // Loga a requisição recebida
  console.log('=== REQUISIÇÃO RECEBIDA ===');
  console.log('Método:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { messageText } = req.body || {};

  if (!messageText) {
    return res.status(400).json({ error: 'messageText ausente' });
  }

  const BOT_TOKEN = '9071319338:AAHtLC7ry2rypI2BXsAFLR0yhcJjmDf5C6g';
  const CHAT_ID = '5012456855';
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const payload = {
    chat_id: CHAT_ID,
    text: messageText,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  console.log('Enviando para:', url);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Telegram HTTP ${response.status}: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Telegram respondeu:', JSON.stringify(data));
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('ERRO NO PROXY:', error.message);
    res.status(500).json({ error: error.message });
  });
}
