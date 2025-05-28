// Número da Equatorial Energia Piauí
const PHONE_NUMBER = "558632288200";
const MENSAGEM_INICIAL = "bom dia";

const MESSAGES = [
  "bom dia",              // Saudação inicial (bot responde com menu)
  "4",                    // Escolher "Consulta de Débitos" (4)
  "79123716304",          // Enviar CPF
  "2",                    // Escolher imóvel nº 2
  "2",                    // Escolher conta nº 2
  "Pagar boleto",         // Escolher forma de pagamento
  "7912",                 // Validar com 4 primeiros dígitos do CPF
  "Não",                  // Responder que não quer receber outra conta
  "5"                     // Avaliação da conversa (muito bom)
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

// 2. Envia uma mensagem no campo de texto
function sendMessage(text) {
  const messageBox = document.querySelector("div[contenteditable='true'][data-tab='10'][role='textbox']");
  if (!messageBox) {
    console.error("⛔ Caixa de mensagem não encontrada.");
    return false;
  }

  messageBox.focus();
  // Insere o texto simulando digitação
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: 'insertText'
  });

  messageBox.textContent = text;
  messageBox.dispatchEvent(inputEvent);

  const sendButton = document.querySelector("button[aria-label='Send']");
  if (sendButton) {
    sendButton.click();
    console.log(`✅ Mensagem enviada: "${text}"`);
    return true;
  }

  console.error("⛔ Botão de enviar mensagem não encontrado.");
  return false;
}

// 3. Espera o chat carregar e começa a observar para enviar as mensagens
function waitForChatAndObserve() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.log("⏳ Aguardando área de chat carregar...");
    setTimeout(waitForChatAndObserve, 1000);
    return;
  }

  console.log("✅ Área de chat carregada. Iniciando observador...");

  const observer = new MutationObserver(() => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (messageIndex < MESSAGES.length) {
        sendMessage(MESSAGES[messageIndex]);
        messageIndex++;
      } else {
        console.log("✅ Todas as mensagens foram enviadas.");
        observer.disconnect();
      }
    }, 3000);
  });

  observer.observe(chat, { childList: true, subtree: true });

  // Envia a primeira mensagem
  setTimeout(() => {
    sendMessage(MESSAGES[messageIndex]);
    messageIndex++;
  }, 3000);
}

// 4. Decide o que fazer com base na URL atual
if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  // Já estamos na conversa, aguarda o chat carregar e começa o processo
  waitForChatAndObserve();
}
