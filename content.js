const PHONE_NUMBER = "558632288200";

// Dados do cliente alvo
const CLIENTE = {
  cpfCnpj: "79123716304",
  nascimentoOuEmail: "01/01/1990",
  contaContrato: "000014832690"
};

// Máquina de estados
const FLOW = {
  INITIAL: {
    condition: (msg) => msg.includes("Sobre o que você quer falar"),
    action: () => "6",
    nextState: "PEDIR_DOCUMENTO"
  },
  PEDIR_DOCUMENTO: {
    condition: (msg) => msg.includes(" informe o CPF ou CNPJ"),
    action: () => CLIENTE.cpfCnpj,
    nextState: "PEDIR_CONTA_CONTRATO"
  },
  PEDIR_CONTA_CONTRATO: {
    condition: (msg) => msg.includes("Digite o número do Contra Contrato"),
    action: () => CLIENTE.contaContrato,
    nextState: "ESCOLHER_CONTA"
  },
  ESCOLHER_CONTA: {
    condition: (msg) => msg.includes("Qual conta você quer receber agora?"),
    action: (msg) => {
      const container = Array.from(document.querySelectorAll("div.message-in")).pop();
      const blocks = container.querySelectorAll("span.copyable-text");

      let currentOption = null;
      let referenceFound = null;

      blocks.forEach((span) => {
        const text = span.innerText.trim();

        // Detecta o número da opção
        const matchOption = text.match(/^(\d+)\s*-\s*$/);
        if (matchOption) {
          currentOption = matchOption[1]; // salva o número como "1"
        }

        // Detecta a referência
        if (text.includes("Referência") && text.includes(CLIENTE.referencia)) {
          referenceFound = currentOption;
        }
      });

      return referenceFound || "1"; // fallback para 1
    },
    nextState: "FINAL"
  },
  FINAL: {
    condition: () => true,
    action: () => {
      console.log("✅ Fluxo finalizado para este cliente.");
      return null;
    },
    nextState: null
  }
};

let currentState = "INITIAL";

// Redirecionamento para o número do bot
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

// Envio de mensagens
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

// Clique no botão de download do PDF
function clickDownloadButton() {
  const downloadSpan = document.querySelector("span[data-icon='document-PDF-icon']");
  if (downloadSpan && downloadSpan.parentElement) {
    downloadSpan.parentElement.click();
    console.log("✅ Botão de download clicado.");
  } else {
    console.log("⛔ Botão de download não encontrado.");
  }
}

// Lê a última mensagem recebida do bot
function getLastBotMessage() {
  const messages = document.querySelectorAll("div.message-in");
  if (!messages.length) return null;

  const last = messages[messages.length - 1];
  const textSpan = last.querySelector("span.selectable-text span");
  return textSpan?.innerText || null;
}

// Controla o fluxo principal baseado nos estados
function handleBotResponse() {
  const message = getLastBotMessage();
  if (!message) {
    console.log("⚠️ Nenhuma mensagem encontrada ainda...");
    setTimeout(handleBotResponse, 5000);
    return;
  }

  console.log(`📨 Última mensagem do bot: "${message}"`);

  const state = FLOW[currentState];
  if (state && state.condition(message)) {
    const response = state.action();
    if (response) {
      typeAndSendMessage(response);
    }
    currentState = state.nextState;
    if (currentState) {
      setTimeout(handleBotResponse, 10000);
    }
  } else {
    console.log(`❌ Mensagem não condiz com o estado atual (${currentState}).`);
    setTimeout(handleBotResponse, 10000);
  }
}

// Começa após a conversa estar aberta
function waitForChatAndStartFlow() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.log("⏳ Aguardando área de chat carregar...");
    setTimeout(waitForChatAndStartFlow, 1000);
    return;
  }

  console.log("✅ Área de chat carregada. Iniciando fluxo...");
  typeAndSendMessage("Bom dia");
  setTimeout(handleBotResponse, 10000);
}

// Inicializador
if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  waitForChatAndStartFlow();
}
