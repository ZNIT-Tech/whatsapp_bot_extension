// Número da Equatorial Energia Piauí
const PHONE_NUMBER = "558632288200";
const MENSAGEM = "bom dia";

// 1. Espera o WhatsApp Web carregar e redireciona para a conversa
function waitForWhatsAppToLoad() {
  const appElement = document.querySelector("#app");
  if (appElement) {
    console.log("✅ WhatsApp Web carregado. Redirecionando...");
    const url = `https://web.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${encodeURIComponent(MENSAGEM)}`;
    window.location.href = url;
  } else {
    console.log("⏳ Aguardando WhatsApp carregar...");
    setTimeout(waitForWhatsAppToLoad, 1000);
  }
}

// 2. Após o redirecionamento, tenta enviar a mensagem
function trySendMessage() {
  const inputBox = document.querySelector('[contenteditable="true"][data-tab]');
  const sendButton = document.querySelector('span[data-icon="send"]');

  if (inputBox && sendButton) {
    inputBox.focus();
    document.execCommand("insertText", false, MENSAGEM);
    setTimeout(() => {
      sendButton.click();
      console.log("✅ Mensagem enviada.");
    }, 500);
  } else {
    console.log("⏳ Esperando campo ou botão aparecer...");
    setTimeout(trySendMessage, 1000);
  }
}

// Detecta se estamos na página inicial ou na página de conversa
if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  // Já estamos na conversa, tenta enviar a mensagem
  setTimeout(trySendMessage, 3000); // dá um tempinho pra interface carregar
}
