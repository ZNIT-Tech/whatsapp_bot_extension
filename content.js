const PHONE_NUMBER = "558632288200";

// Dados do cliente alvo
const CLIENTE = {
  cpfCnpj: "79123716304",
  nascimentoOuEmail: "01/01/1990",
  contaContrato: "000014832690",
  alvo : "05/2025"
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
      const regex = /(\d+)\s*-\s*Referência:\s*(\d{2}\/\d{4})/g;
      let match;
      let referenceFound = null;

      while ((match = regex.exec(msg)) !== null) {
        const optionNumber = match[1]; // Ex: "1"
        const referencia = match[2];   // Ex: "06/2025"

        if (referencia === CLIENTE.alvo) {
          referenceFound = optionNumber;
          break;
        }
      }

      const resposta = referenceFound || "1"; //mas não podemos baixar a conta errada
      console.log(`📌 Opção escolhida com referência ${CLIENTE.alvo}: ${resposta}${referenceFound ? "" : " (referência não encontrada)"}`);
      return resposta;
    },
    nextState: "OPCAO_PAGAMENTO"
  },
  OPCAO_PAGAMENTO: {
    condition: (msg) => msg.includes("Posso te enviar essa conta por aqui"),
    action: () => "Pagar boleto",
    nextState: "VALIDAR"
  },
  VALIDAR: {
    condition: (msg) => msg.includes("Digite os 4 primeiros dígitos do CPF ou CNPJ"),
    action: () => {
      const resposta = CLIENTE.cpfCnpj.slice(0, 4);
      setTimeout(monitorarDownloadPDF, 10000); // inicia monitoramento após 10s
      return resposta;
    },
    nextState: "PROXIMA_CONTA"
  },
  PROXIMA_CONTA: {
    condition: (msg) => msg.includes("Quer receber alguma outra conta?"),
    action: () => "Não",
    nextState: "POSSO_AJUDAR"
  },
  POSSO_AJUDAR: {
    condition: (msg) => msg.includes("Posso te ajudar com mais alguma coisa?"),
    action: () => "Não",
    nextState: "AVALIAR"
  },
  AVALIAR: {
    condition: (msg) => msg.includes("Antes de encerrar"),
    action: () => "5",
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

function monitorarDownloadPDF(tentativas = 0) {
  const MAX_TENTATIVAS = 30; // tenta por ~30s
  const downloadSpan = document.querySelector("span[data-icon='document-PDF-icon']");

  if (downloadSpan && downloadSpan.parentElement) {
    downloadSpan.parentElement.click();
    console.log("✅ Botão de download clicado.");
  } else if (tentativas < MAX_TENTATIVAS) {
    console.log(`🔎 Procurando botão de download... (${tentativas + 1}/${MAX_TENTATIVAS})`);
    setTimeout(() => monitorarDownloadPDF(tentativas + 1), 1000);
  } else {
    console.log("⛔ Botão de download não encontrado após várias tentativas.");
  }
}

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


// Função para extrair texto completo da última mensagem do bot
function getLastBotMessage() {
  const messages = document.querySelectorAll("div.message-in");
  if (!messages.length) return null;

  const last = messages[messages.length - 1];

  function extractFullMessage(element) {
    let result = "";
    function recursiveTextExtract(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
          recursiveTextExtract(child);
        }
      }
    }
    recursiveTextExtract(element);
    return result.trim().replace(/\s+/g, " ");
  }

  const textContainer = last.querySelector("span.selectable-text");
  return textContainer ? extractFullMessage(textContainer) : null;
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
