# Automação de Mensagens no WhatsApp Web com Download Automatico

Este script automatiza o envio de mensagens sequenciais via **WhatsApp Web** e realiza o clique no botao de download assim que um arquivo (por exemplo, um PDF) e enviado. Ideal para processos repetitivos em interacoes com bots ou sistemas automatizados.

## Funcionamento do Script

### Variaveis Iniciais

```js
const PHONE_NUMBER = "558632288200";
const MESSAGES = [
  "Bom dia",
  "6",
  "79123716304",
  "2",
  "1",
  "Pagar boleto",
  "7912",
  "Nao",
  "Nao",
  "3"
];

const DELAYS = [19000, 18000, 18000, 17000, 18000, 18000, 18000, 17000, 17000, 17000];
```

* Cada mensagem e enviada com o tempo de espera correspondente em `DELAYS`.
* Quando a mensagem "7912" e enviada, o script aguarda um tempo extra e tenta clicar no botao de download do arquivo.

### Etapas

#### 1. Aguardar o carregamento do WhatsApp Web

```js
function waitForWhatsAppToLoad() { ... }
```

Verifica se o WhatsApp Web esta carregado e redireciona para a conversa com o numero definido.

#### 2. Enviar mensagens

```js
function typeAndSendMessage(text) { ... }
```

Simula a digitacao e envio da mensagem, disparando um evento de input e clicando no botao de envio.

#### 3. Clicar no botao de download

```js
function clickDownloadButton() { ... }
```

Identifica o botao com o `data-icon='audio-download'` (utilizado tambem por arquivos) e simula um clique para iniciar o download.

#### 4. Sequencia de envio

```js
function waitForChatAndSend() { ... }
```

Verifica se a interface de chat esta pronta e inicia o envio das mensagens com seus respectivos atrasos. Quando encontra a mensagem "7912", agenda o clique no botao de download com 3 segundos extras.

#### 5. Inicializacao

```js
if (!window.location.href.includes("/send?phone=")) {
  waitForWhatsAppToLoad();
} else {
  waitForChatAndSend();
}
```

Se ainda nao estiver na tela da conversa, redireciona para ela. Caso contrario, comeca a automacao.

---

## Requisitos do Navegador

Para que o clique no botao de download funcione corretamente sem interacao adicional:

### Chrome

1. Acesse `chrome://settings/downloads`
2. Desative a opcao:

   * "Perguntar onde salvar cada arquivo antes de fazer o download"

> Com isso, o clique no botao inicia automaticamente o download na pasta padrao sem necessidade de pressionar ENTER ou confirmar.

---

## Consideracoes Finais

* O script deve ser colado no console de desenvolvedor do navegador (F12 > Console).
* Uso destinado a automacoes internas com permissao legal para execucao.
* Dependente da estrutura do WhatsApp Web, sujeito a mudancas no DOM.

Este processo automatizado tem como objetivo agilizar tarefas repetitivas na sua empresa, como recuperar arquivos enviados automaticamente por bots de atendimento.
