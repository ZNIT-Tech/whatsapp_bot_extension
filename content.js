// Número da Equatorial Energia Piauí
const PHONE_NUMBER = "558632288200";
const MESSAGES = [
  "bom dia",
  "4",
  "79123716304",
  "2",
  "2",
  "Pagar boleto",
  "7912",
  "Não",
  "5"
];

let messageIndex = 0;
let timeoutId = null;

// 1. Espera o WhatsApp Web carregar e redireciona para a conversa
function waitForWhatsAppToLoad() {
  const appElement = document.querySelector("#app");
  if (appElement) {
    console.log("✅ WhatsApp Web carregado. Redirecionando...");
    const url = `https://web.whatsapp.com/send?phone=${PHONE_NUMBER}`;
    window.location.href = url;
  } else {
    console.log("⏳ Aguardando WhatsApp carregar...");
    setTimeout(waitForWhatsAppToLoad, 1000);
  }
}

// 2. Digita e envia a mensagem com atrasos entre as ações
function typeAndSendMessage(text) {
  const messageBox = document.querySelector("div[contenteditable='true'][data-tab='10']");
  if (!messageBox) {
    console.error("⛔ Caixa de mensagem não encontrada.");
    return;
  }

  messageBox.focus();
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: 'insertText'
  });

  messageBox.textContent = text;
  messageBox.dispatchEvent(inputEvent);

  // Espera 1 segundo para o botão "enviar" ficar ativo
  setTimeout(() => {
    const sendButton = document.querySelector("button[data-tab='11']");
    if (sendButton) {
      sendButton.click();
      console.log(`✅ Mensagem enviada: "${text}"`);
    } else {
      console.error("⛔ Botão de enviar mensagem não encontrado.");
    }
  }, 1000);
}

// 3. Espera o chat carregar e começa a enviar mensagens com intervalo
function waitForChatAndSend() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.log("⏳ Aguardando área de chat carregar...");
    setTimeout(waitForChatAndSend, 1000);
    return;
  }

  console.log("✅ Área de chat carregada. Iniciando envio...");

  const sendNextMessage = () => {
    if (messageIndex < MESSAGES.length) {
      typeAndSendMessage(MESSAGES[messageIndex]);
      messageIndex++;
      timeoutId = setTimeout(sendNextMessage, 4000); // Espera 4s antes da próxima mensagem
    } else {
      console.log("✅ Todas as mensagens foram enviadas.");
    }
  };

  // Envia a primeira mensagem após 3s
  setTimeout(sendNextMessage, 3000);
}

// 4. Decide o que fazer com base na URL atual
if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  waitForChatAndSend();
}
