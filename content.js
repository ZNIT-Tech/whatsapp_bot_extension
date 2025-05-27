const CONTACT_NAME = "Equatorial Energia Piauí";

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

function sendMessage(text) {
  const messageBox = document.querySelector("div[contenteditable='true'][data-tab='10'][role='textbox']");
  if (!messageBox) {
    console.error("Caixa de mensagem não encontrada.");
    return false;
  }
  messageBox.focus();
  document.execCommand("insertText", false, text);
  const sendButton = document.querySelector("button[aria-label='Send']");
  if (sendButton) {
    sendButton.click();
    console.log(`✅ Mensagem enviada: "${text}"`);
    return true;
  }
  console.error("Botão de enviar mensagem não encontrado.");
  return false;
}

function setupObserver() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.error("Área de chat não encontrada.");
    return;
  }

  const observer = new MutationObserver(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Espera 3 segundos após a última mensagem do bot para enviar a próxima
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
}

function openChatByName(name, retries = 20) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const chats = document.querySelectorAll("span[title]");
      for (const chat of chats) {
        if (chat.getAttribute("title") === name) {
          chat.click();
          clearInterval(interval);
          console.log(`📨 Chat com "${name}" aberto.`);
          resolve(true);
          return;
        }
      }
      retries--;
      if (retries <= 0) {
        clearInterval(interval);
        console.error(`❌ Contato "${name}" não encontrado após várias tentativas.`);
        reject(false);
      }
    }, 500);
  });
}

async function startAutomation() {
  try {
    await openChatByName(CONTACT_NAME);
    // Espera o chat abrir e carregar
    setTimeout(() => {
      messageIndex = 0;
      sendMessage(MESSAGES[messageIndex]);
      messageIndex++;
      setupObserver();
    }, 4000);
  } catch {
    console.error("Erro: não foi possível abrir o chat.");
  }
}

// Rodar script após um tempo para garantir carregamento da página
setTimeout(() => {
  startAutomation();
}, 8000);
