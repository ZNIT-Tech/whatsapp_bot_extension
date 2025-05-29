const PHONE_NUMBER = "558632288200";
const MESSAGES = [
  "Bom dia",           // espera 19s
  "6",                 // espera 18s
  "79123716304",       // espera 18s
  "2",                 // espera 17s
  "2",                 // espera 18s
  "Pagar boleto",      // espera 18s
  "7912",              // espera 18s -> aqui o arquivo chega, vamos disparar o clique para download
  "Não",               // espera 17s
  "Não",               // espera 17s
  "3"                  // avaliação final
];

const DELAYS = [19000, 18000, 18000, 17000, 18000, 18000, 18000, 17000, 17000, 17000];

let messageIndex = 0;

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

// Função que clica no botão de download do PDF, tentando encontrar o botão
function clickDownloadButton() {
  // Aqui uso o seletor que busca a span com data-icon e clica no pai div
  const downloadSpan = document.querySelector("span[data-icon='document-PDF-icon']");
  if (downloadSpan && downloadSpan.parentElement) {
    downloadSpan.parentElement.click();
    console.log("✅ Botão de download clicado.");
  } else {
    console.log("⛔ Botão de download não encontrado.");
  }
}

function waitForChatAndSend() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.log("⏳ Aguardando área de chat carregar...");
    setTimeout(waitForChatAndSend, 1000);
    return;
  }

  console.log("✅ Área de chat carregada. Iniciando envio com tempos ajustados...");

  const sendNextMessage = () => {
    if (messageIndex < MESSAGES.length) {
      typeAndSendMessage(MESSAGES[messageIndex]);
      
      // Se a mensagem enviada for "7912" (índice 6), após o delay, tentar clicar no botão de download
      if (MESSAGES[messageIndex] === "7912") {
        // Aguarda o tempo da mensagem + 3s para o botão aparecer e tenta clicar
        setTimeout(() => {
          clickDownloadButton();
        }, DELAYS[messageIndex] + 3000);
      }
      
      const waitTime = DELAYS[messageIndex];
      messageIndex++;
      setTimeout(sendNextMessage, waitTime);
    } else {
      console.log("✅ Todas as mensagens foram enviadas.");
    }
  };

  setTimeout(sendNextMessage, 3000);
}

if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  waitForChatAndSend();
}
