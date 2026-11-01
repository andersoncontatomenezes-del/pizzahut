// api/proxy.js
export default function handler(req, res) {
  if (req.method !== 'POST' || !req.body || !req.body.messageText) {
    return res.status(400).json({ error: 'Requisição inválida' });
  }

  const { messageText } = req.body;
  
  // Usa variáveis de ambiente
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Variáveis de ambiente não configuradas' });
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: CHAT_ID,
    text: messageText,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => res.status(200).json(data))
  .catch(error => {
    console.error('Erro ao enviar para Telegram:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  });
}
