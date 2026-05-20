/**
 * Optional SMTP e-mail. If not configured, reset links are logged to the server console.
 */
async function sendPasswordResetEmail(to, resetUrl) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('\n[HabitMeet] Şifre sıfırlama bağlantısı (SMTP yapılandırılmadı):');
    console.log(`  E-posta: ${to}`);
    console.log(`  Bağlantı: ${resetUrl}\n`);
    return { sent: false, logged: true };
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    console.log('\n[HabitMeet] nodemailer yüklü değil. Bağlantı:', resetUrl, '\n');
    return { sent: false, logged: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  const from = process.env.SMTP_FROM || user;

  await transporter.sendMail({
    from,
    to,
    subject: 'HabitMeet — Şifre sıfırlama',
    text: `Şifrenizi sıfırlamak için bu bağlantıyı açın (1 saat geçerlidir):\n\n${resetUrl}\n\nBu isteği siz yapmadıysanız bu e-postayı yok sayın.`,
    html: `<p>Şifrenizi sıfırlamak için <a href="${resetUrl}">buraya tıklayın</a> (1 saat geçerlidir).</p><p>Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>`,
  });

  return { sent: true };
}

module.exports = { sendPasswordResetEmail };
