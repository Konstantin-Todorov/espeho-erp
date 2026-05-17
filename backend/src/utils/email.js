const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Require SMTP config from env
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

const FROM = process.env.SMTP_FROM || '"ЕСПЕХО ERP" <erp@espeho.bg>';

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    // Email not configured — log but don't crash
    console.log(`[EMAIL] Not configured. Would send to ${to}: ${subject}`);
    return;
  }
  try {
    await t.sendMail({ from: FROM, to, subject, html, text });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err.message);
  }
}

// Template helpers
function orderReadyEmail(orderNumber, clientName, trackUrl) {
  return {
    subject: `Поръчка ${orderNumber} е готова`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#3b82f6;">🏭 ЕСПЕХО ООД</h2>
        <h3>Вашата поръчка е готова</h3>
        <p>Уважаеми ${clientName},</p>
        <p>Вашата поръчка <strong>${orderNumber}</strong> е завършена и готова за доставка/вземане.</p>
        ${trackUrl ? `<p><a href="${trackUrl}" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">Проследи поръчката</a></p>` : ''}
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
        <p style="color:#666;font-size:12px;">ЕСПЕХО ООД — ERP система</p>
      </div>`,
    text: `Поръчка ${orderNumber} е готова. Уважаеми ${clientName}, вашата поръчка е завършена и готова.`,
  };
}

function overdueEmail(orderNumber, clientName, deadline) {
  return {
    subject: `Внимание: Просрочена поръчка ${orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#ef4444;">⚠️ ЕСПЕХО ERP — Предупреждение</h2>
        <h3>Просрочена поръчка</h3>
        <p>Поръчка <strong>${orderNumber}</strong> (клиент: ${clientName}) е просрочена.</p>
        <p>Краен срок беше: <strong>${deadline}</strong></p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
        <p style="color:#666;font-size:12px;">ЕСПЕХО ООД — ERP система</p>
      </div>`,
    text: `Просрочена поръчка ${orderNumber}. Клиент: ${clientName}. Краен срок: ${deadline}.`,
  };
}

function lowStockEmail(materialName, quantity, minThreshold) {
  return {
    subject: `Ниска наличност: ${materialName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#f59e0b;">📦 ЕСПЕХО ERP — Склад</h2>
        <h3>Ниска наличност</h3>
        <p>Материал <strong>${materialName}</strong> е под минималния праг.</p>
        <table style="border-collapse:collapse;margin-top:10px;">
          <tr><td style="padding:6px 12px;border:1px solid #eee;">Налично</td><td style="padding:6px 12px;border:1px solid #eee;color:#ef4444;font-weight:bold;">${quantity}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #eee;">Минимум</td><td style="padding:6px 12px;border:1px solid #eee;">${minThreshold}</td></tr>
        </table>
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
        <p style="color:#666;font-size:12px;">ЕСПЕХО ООД — ERP система</p>
      </div>`,
    text: `Ниска наличност: ${materialName}. Налично: ${quantity}. Минимум: ${minThreshold}.`,
  };
}

module.exports = { sendEmail, orderReadyEmail, overdueEmail, lowStockEmail };
