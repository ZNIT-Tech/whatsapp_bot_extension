const PHONE_NUMBER = "558632288200"; // Substitua pelo número do bot

// Dados do cliente (CPF ou CNPJ + info de validação)
const CLIENTE = {
  cpfCnpj: "79123716304", // Pode ser CPF ou CNPJ
  nascimentoOuEmail: "mcpapelaria@outlook.com", // Ou data de nascimento
  contaContrato: "3000614440",
  alvo: "05/2025"
};

// Ações baseadas na mensagem do bot
const ACOES = [
  {
    condicao: msg =>
      msg.toLowerCase().includes("obre o que você quer falar"),
    resposta: () => "6"
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("informe o cpf") ||
      msg.toLowerCase().includes("informe o cnpj") ||
      msg.toLowerCase().includes("conta contrato do imóvel"),
    resposta: () => CLIENTE.cpfCnpj
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("é para esse imóvel que você deseja atendimento"),
    resposta: () => "Sim"
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("como prefere") &&
      msg.toLowerCase().includes("cartão") &&
      msg.toLowerCase().includes("pix") &&
      msg.toLowerCase().includes("código de barras"),
    resposta: () => "Pagar boleto"
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("digite o e-mail completo"),
    resposta: () => CLIENTE.nascimentoOuEmail
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("quer receber alguma outra conta"),
    resposta: () => "Não"
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("osso te ajudar com mais alguma coisa"),
    resposta: () => "Não"
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("ntes de encerrar, você pode me contar o que achou da nossa conversa"),
    resposta: () => "5"
  },
  {
    condicao: msg => msg.toLowerCase().includes("qual conta você quer receber agora"),
    resposta: (msg) => {
      const regex = /(\d+)\s*-\s*referência:\s*([\d/]+)/gi;
      let match;
      while ((match = regex.exec(msg)) !== null) {
        const opcao = match[1];
        const referencia = match[2];
        if (referencia === CLIENTE.alvo) {
          return opcao;  // Retorna o número da opção encontrada
        }
      }
      // Se não encontrou, retorna mensagem padrão ou string vazia
      console.log("⚠️ Nenhuma opção correspondente encontrada.");
      return "1";
    }
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("igite o número do contra contrato"),
    resposta: () => CLIENTE.contaContrato
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("4 primeiros dígitos do CPF") ||
      msg.toLowerCase().includes("os 4 primeiros dígitos"),
    resposta: () => CLIENTE.cpfCnpj.slice(0, 4)
  }
];

// Espera e clica no botão de download do PDF
function monitorarDownloadPDF(tentativas = 0) {
  const MAX_TENTATIVAS = 30;
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

// Redireciona para o número do bot
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

// Envia mensagem para o chat
function typeAndSendMessage(text) {
  const messageBox = document.querySelector("div[contenteditable='true'][data-tab='10']");
  if (!messageBox) {
    console.error("⛔ Caixa de mensagem não encontrada.");
    return;
  }

  messageBox.focus();
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: "insertText"
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

// Extrai o texto da última mensagem recebida
function getLastBotMessage() {
  const messages = document.querySelectorAll("div.message-in");
  if (!messages.length) return null;

  const last = messages[messages.length - 1];
  const textContainer = last.querySelector("span.selectable-text");

  function extractText(node) {
    let result = "";
    function recursive(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) recursive(child);
      }
    }
    recursive(node);
    return result.trim().replace(/\s+/g, " ");
  }

  return textContainer ? extractText(textContainer) : null;
}

// Verifica a mensagem e responde se necessário
function handleBotResponse() {
  const message = getLastBotMessage();
  if (!message) {
    console.log("⚠️ Nenhuma mensagem encontrada.");
    setTimeout(handleBotResponse, 10000);
    return;
  }

  console.log(`📨 Última mensagem: "${message}"`);

  for (const acao of ACOES) {
  if (acao.condicao(message)) {
    const resposta = acao.resposta(message); // <-- passa a mensagem aqui
    console.log("💬 Respondendo com:", resposta);
    typeAndSendMessage(resposta);
    break;
  }
}

  // Espera 10s para checar a próxima mensagem
  setTimeout(handleBotResponse, 10000);
}



// Espera o chat abrir e inicia o fluxo
function waitForChatAndStartFlow() {
  const chat = document.querySelector("#main");
  if (!chat) {
    console.log("⏳ Aguardando chat carregar...");
    setTimeout(waitForChatAndStartFlow, 1000);
    return;
  }

  console.log("✅ Chat carregado. Iniciando atendimento...");
  typeAndSendMessage("Bom dia");
  setTimeout(handleBotResponse, 10000);
}

// Início automático
if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  waitForChatAndStartFlow();
}
