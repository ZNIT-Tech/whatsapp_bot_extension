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
      msg.toLowerCase().includes("Certo. Preciso que informe a Conta Contrato"),
    resposta: () => CLIENTE ? CLIENTE.contaContrato : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("contra contrato ou a sequencia"),
    resposta: () => CLIENTE ? CLIENTE.contaContrato : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("digitar o número do contra contrato ou a letra desejada."),
    resposta: () => CLIENTE ? CLIENTE.contaContrato : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("4 primeiros dígitos do CPF") ||
      msg.toLowerCase().includes("os 4 primeiros dígitos"),
    resposta: () => CLIENTE ? CLIENTE.cpfCnpj.slice(0, 4) : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("preciso que informe a conta contrato"),
    resposta: () => CLIENTE ? CLIENTE.contaContrato : ""
  },
  {
    condicao: msg =>
      msg.toLowerCase().includes("data de nascimento"),
    resposta: () => CLIENTE ? CLIENTE.nascimentoOuEmail : ""
  }
];

// Função para buscar cliente na API
let LISTA_CLIENTES = null;

async function carregarCliente(index) {
  try {
    if (!LISTA_CLIENTES) {
      const response = await chrome.runtime.sendMessage({
        action: "getClientes"
      });

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error("Resposta da API inválida");
      }

      LISTA_CLIENTES = response.data;
    }

    if (index >= LISTA_CLIENTES.length) {
      console.warn(`Índice ${index} excede total (${LISTA_CLIENTES.length}).`);
      return null;
    }

    const cli = LISTA_CLIENTES[index];
    return {
      cpfCnpj: cli.cnpj_cpf,
      nascimentoOuEmail: cli.email_data,
      contaContrato: cli.ucs || "",
      alvo: cli.alvo || ""
    };

  } catch (err) {
    console.error("💥 Erro ao carregar cliente via background:", err);
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

/**
 * Lê a última mensagem do bot e toma a próxima ação.
 * – Detecta fim do atendimento, avança (em loop) para o próximo cliente.
 * – Percorre a tabela ACOES e responde a cada prompt do bot.
 */
function handleBotResponse() {
  const message = getLastBotMessage();

  /* ----------------- 1. Sem mensagem? aguarda 10 s ----------------- */
  if (!message) {
    console.log("⚠️ Nenhuma mensagem encontrada.");
    setTimeout(handleBotResponse, 10_000);
    return;
  }

  const lowerMsg = message.toLowerCase();
  console.log(`📨 Última mensagem: "${message}"`);

  /* --------------- 2. Detecta frases de encerramento ---------------- */
  const encerrou =
    lowerMsg.includes("que bom! fico muito feliz de te ajudar") ||
    lowerMsg.includes("obrigada por compartilhar sua opinião comigo.") ||
    lowerMsg.includes("você pode tirar suas dúvidas no nosso site") ||
    lowerMsg.includes("eu ainda não consigo te ajudar com esse assunto por aqui.");

  if (encerrou) {
    console.log("✅ Fluxo finalizado com cliente atual.");

    // Próximo cliente em loop: (i + 1) mod total
    if (LISTA_CLIENTES && LISTA_CLIENTES.length) {
      indiceCliente = (indiceCliente + 1) % LISTA_CLIENTES.length;
    } else {
      indiceCliente = 0;           // fallback se a lista não existir
    }

    mensagensAnteriores = [];       // zera o buffer antitravamento
    setTimeout(() => iniciarBot(indiceCliente), 10_000);  // recomeça em 10 s
    return;
  }

  /* --------------------- 3. Tabela de ações ------------------------ */
  for (const acao of ACOES) {
    if (acao.condicao(message)) {   // (usa mensagem original para manter lógica)
      const resposta = acao.resposta(message);
      console.log("💬 Respondendo com:", resposta);
      if (resposta !== undefined && resposta !== null) {
        typeAndSendMessage(String(resposta));
      }
      break;                        // evita responder duas vezes
    }
  }

  /* --------------------- 4. Reagenda verificação ------------------- */
  setTimeout(handleBotResponse, 10_000);
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
  setTimeout(handleBotResponse, 19000);
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
