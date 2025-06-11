const PHONE_NUMBER = "558632288200";
const CHAT_URL = `https://web.whatsapp.com/send?phone=${PHONE_NUMBER}`;
const PRIMEIRA_MSG = "Bom dia";

function waitForWhatsAppToLoad() {
  const appElement = document.querySelector("#app");
  if (appElement) {
    if (!window.location.href.includes(PHONE_NUMBER)) {
      console.log("✅ WhatsApp carregado. Redirecionando para Equatorial...");
      window.location.href = CHAT_URL;
    } else {
      waitForChatAndSend();
    }
  } else {
    console.log("⏳ Aguardando WhatsApp carregar...");
    setTimeout(waitForWhatsAppToLoad, 1000);
  }
}

function typeAndSendMessage(text) {
  const messageBox = document.querySelector("div[contenteditable='true'][data-tab='10']");
  if (!messageBox) {
    console.error("⛔ Caixa de mensagem não encontrada.");
    return false;
  }

  messageBox.focus();
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: "insertText",
  });

  messageBox.textContent = text;
  messageBox.dispatchEvent(inputEvent);

  setTimeout(() => {
    const sendButton = document.querySelector("button[data-tab='11']");
    if (sendButton) {
      sendButton.click();
      console.log(`✅ Mensagem enviada: "${text}"`);
      waitAndReadLastMessage();
    } else {
      console.error("⛔ Botão de enviar não encontrado.");
    }
  }, 1000);
}

function waitAndReadLastMessage() {
  console.log("⏳ Esperando 10 segundos para verificar resposta...");
  setTimeout(() => {
    const messages = document.querySelectorAll("div.message-in");
    if (!messages.length) {
      alert("❌ Nenhuma mensagem recebida encontrada.");
      return;
    }
    const last = messages[messages.length - 1];
    const textSpan = last.querySelector("span.selectable-text span");
    const message = textSpan?.innerText || "(sem texto)";
    alert("📨 Última mensagem recebida:\n\n" + message);
  }, 10000);
}

function waitForChatAndSend() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.log("⏳ Aguardando área de chat carregar...");
    setTimeout(waitForChatAndSend, 1000);
    return;
  }

  console.log("✅ Chat carregado. Preparando envio...");
  typeAndSendMessage(PRIMEIRA_MSG);
}

// Começa o fluxo
waitForWhatsAppToLoad();
