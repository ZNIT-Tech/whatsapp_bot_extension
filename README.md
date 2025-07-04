# Bot Automatizado de Atendimento via WhatsApp Web — ZNIT

Este projeto é um **bot de automação de atendimento** para uso no WhatsApp Web, desenvolvido pela equipe técnica da **ZNIT**. Seu objetivo é interagir com um bot de atendimento de empresas fornecedoras (ex: concessionárias de energia), simulando conversas humanas de forma segura, repetível e automática.

---

##  Funcionalidades

- Interação automática com o bot via mensagens inteligentes.
- Extração e clique automático no botão de download de faturas em PDF.
- Tratamento de loops de travamento no atendimento (mensagens repetidas).
- Integração com background script para carregamento de dados dos clientes.
- Fluxo completo de atendimento para múltiplos clientes em sequência.

---

##  Estrutura do Código

- `PHONE_NUMBER`: número do bot com o qual o script interage.
- `CLIENTE`: dados dinâmicos carregados da API.
- `ACOES`: matriz de condições e respostas automatizadas.
- `handleBotResponse`: motor principal do fluxo de conversa.
- `monitorarDownloadPDF`: detecção e clique no botão de download.
- `iniciarBot`: ponto de entrada do sistema.

---

## Como Funciona

1. Ao carregar a página do WhatsApp Web, o script redireciona automaticamente para o número do bot configurado.
2. A primeira mensagem enviada é `"Bom dia"`, iniciando o atendimento.
3. O script responde dinamicamente às mensagens do bot, conforme regras definidas em `ACOES`.
4. Se for identificado um travamento (mesma mensagem 3 vezes seguidas), o script envia `"Olá"` para tentar destravar o atendimento.
5. Ao final do atendimento de um cliente, o script inicia automaticamente o atendimento ao próximo.

---

## Instalação e Uso

1. **Pré-requisitos:**
   - Google Chrome instalado.
   - Extensão de automação configurada (ex: via extensão customizada do `Chrome Extension` com permissões adequadas).
   - API de clientes acessível via `chrome.runtime.sendMessage({ action: "getClientes" })`.

2. **Passos para rodar:**

   - Copie o código para o script principal da extensão ou ferramenta de automação.
   - Acesse [https://web.whatsapp.com](https://web.whatsapp.com).
   - Faça login com sua conta do WhatsApp.
   - O bot será iniciado automaticamente para o número do bot definido em `PHONE_NUMBER`.

---

## Estrutura Esperada da API de Clientes

A resposta da API `getClientes` deve ser uma lista de objetos com os seguintes campos:

```json
[
  {
    "cnpj_cpf": "12345678901",
    "email_data": "cliente@email.com", // ou data de nascimento
    "ucs": "123456789",
    "alvo": "06/2024"
  },
  ...
]
