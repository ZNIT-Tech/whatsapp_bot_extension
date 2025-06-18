const PHONE_NUMBER = "558632288200"; // Substitua pelo número do bot

let indiceCliente = 0;


// Variável CLIENTE será preenchida dinamicamente após buscar na API
let CLIENTE = null;

let mensagensAnteriores = [];
let contadorRepeticao = 0;
const MAX_REPETICOES = 3;

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
      msg.toLowerCase().includes("informe o cnpj"),
    resposta: () => CLIENTE ? CLIENTE.cpfCnpj : ""
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
    resposta: () => CLIENTE ? CLIENTE.nascimentoOuEmail : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("quer receber alguma outra conta"),
    resposta: () => {
      clickDownloadButton();
      return "Não";
    }
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
      if (!CLIENTE) return "1";
      const regex = /(\d+)\s*-\s*referência:\s*([\d/]+)/gi;
      let match;
      while ((match = regex.exec(msg)) !== null) {
        const opcao = match[1];
        const referencia = match[2];
        if (referencia === CLIENTE.alvo) {
          return opcao;  // Retorna o número da opção encontrada
        }
      }
      console.log("⚠️ Nenhuma opção correspondente encontrada.");
      return "1";
    }
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("igite o número do contra contrato"),
    resposta: () => CLIENTE ? CLIENTE.contaContrato : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("4 primeiros dígitos do CPF") ||
      msg.toLowerCase().includes("os 4 primeiros dígitos"),
    resposta: () => CLIENTE ? CLIENTE.cpfCnpj.slice(0, 4) : ""
  }
];

// Função para buscar cliente na API
async function carregarCliente(index) {
  try {
    const response = await fetch(chrome.runtime.getURL("clientes.json"));
    if (!response.ok) throw new Error(`Erro ao carregar arquivo: ${response.status}`);

    const clientes = await response.json();

    if (!Array.isArray(clientes) || clientes.length === 0) {
      console.error("🚫 Lista de clientes está vazia ou inválida.");
      return null;
    }

    if (index >= clientes.length) {
      console.warn(`⚠️ Índice ${index} fora do alcance. Total de clientes: ${clientes.length}.`);
      return null;
    }

    const cliente = clientes[index];
    if (!cliente || !cliente.cnpj_cpf) {
      console.warn(`⚠️ Cliente inválido no índice ${index}:`, cliente);
      return null;
    }

    return {
      cpfCnpj: cliente.cnpj_cpf,
      nascimentoOuEmail: cliente.email_data,
      contaContrato: cliente.ucs || '',
      alvo: cliente.alvo || ''
    };

  } catch (error) {
    console.error('💥 Erro ao carregar cliente:', error);
    return null;
  }
}




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

  // Verifica se é a mensagem de finalização
  if (message.includes("Que bom! Fico muito feliz de te ajudar") || message.includes("Obrigada por compartilhar sua opinião comigo.")) {
    console.log("✅ Fluxo finalizado com cliente atual.");
    indiceCliente += 1;
    setTimeout(() => iniciarBot(indiceCliente), 10000); // espera 10s e vai para o próximo
    return;
  }

  for (const acao of ACOES) {
    if (acao.condicao(message)) {
      const resposta = acao.resposta(message);
      console.log("💬 Respondendo com:", resposta);
      typeAndSendMessage(resposta);
      break;
    }
  }

  setTimeout(handleBotResponse, 10000);
}


function clickDownloadButton() {
  const downloadSpan = document.querySelector("span[data-icon='document-PDF-icon']");
  if (downloadSpan && downloadSpan.parentElement) {
    downloadSpan.parentElement.click();
    console.log("✅ Botão de download clicado.");
  } else {
    console.log("⛔ Botão de download não encontrado.");
  }
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

function verificarTravamento() {
  const mensagemAtual = getLastBotMessage();
  if (!mensagemAtual) {
    console.log("⚠️ Nenhuma mensagem para verificar travamento.");
    setTimeout(verificarTravamento, 10000);
    return;
  }

  mensagensAnteriores.push(mensagemAtual);
  if (mensagensAnteriores.length > MAX_REPETICOES) {
    mensagensAnteriores.shift(); // Mantém o histórico das últimas 3
  }

  const todasIguais = mensagensAnteriores.every(m => m === mensagensAnteriores[0]);

  if (mensagensAnteriores.length === MAX_REPETICOES && todasIguais) {
    console.log("🔁 Mensagem repetida 3 vezes. Enviando 'Olá' para destravar.");
    typeAndSendMessage("Olá");
    mensagensAnteriores = []; // Resetar histórico após envio
  }

  setTimeout(verificarTravamento, 10000);
}

// Início automático: carrega cliente e depois inicia o bot
async function iniciarBot(index = 0) {
  CLIENTE = await carregarCliente(index);

  if (!CLIENTE) {
    console.error('Não foi possível carregar dados do cliente. Encerrando.');
    return;
  }

  const currentUrl = window.location.href;
  const expectedUrl = `https://web.whatsapp.com/send?phone=${PHONE_NUMBER}`;

  // Checa se já fez redirecionamento nessa sessão
  const redirecionou = sessionStorage.getItem('botRedirecionou');

  if (!currentUrl.includes(`/send?phone=${PHONE_NUMBER}`) && !redirecionou) {
    console.log("🌐 Redirecionando para o número do bot...");
    sessionStorage.setItem('botRedirecionou', 'true'); // Marca que já redirecionou
    window.location.href = expectedUrl;
  } else {
    console.log("✅ No chat do bot, iniciando fluxo...");
    waitForChatAndStartFlow();
  }
}


iniciarBot(indiceCliente);
