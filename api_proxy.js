// api/proxy.js
export default function handler(req, res) {
  const { messageText } = req.body;
  
  // CONFIGURAÇÃO DO TELEGRAM (Oculto do usuário)
  const BOT_TOKEN = '9071319338:AAHtLC7ry2rypI2BXsAFLR0yhcJjmDf5C6g';
  const CHAT_ID = '5012456855';
  
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
  .then(response => {
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Erro ao enviar para Telegram:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  });
}