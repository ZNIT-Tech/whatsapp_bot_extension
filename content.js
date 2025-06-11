// ==UserScript==
// @name         Redirecionar para Equatorial e Ler Última Mensagem
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Vai direto para o chat da Equatorial e permite ler a última mensagem recebida
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const PHONE_NUMBER = "558632288200";
  const CHAT_URL = `https://web.whatsapp.com/send?phone=${PHONE_NUMBER}`;

  // Redireciona automaticamente quando o WhatsApp estiver pronto
  function waitForWhatsAppToLoad() {
    const appElement = document.querySelector("#app");
    if (appElement) {
      if (!window.location.href.includes(PHONE_NUMBER)) {
        console.log("✅ WhatsApp Web carregado. Redirecionando para Equatorial...");
        window.location.href = CHAT_URL;
      } else {
        console.log("✅ Já estamos na conversa da Equatorial.");
        initUI();
      }
    } else {
      console.log("⏳ Aguardando WhatsApp carregar...");
      setTimeout(waitForWhatsAppToLoad, 1000);
    }
  }

  // Adiciona botão para ler última mensagem recebida
  function initUI() {
    // Evita adicionar botão mais de uma vez
    if (document.getElementById("ler-ultima-msg-btn")) return;

    const button = document.createElement("button");
    button.id = "ler-ultima-msg-btn";
    button.innerText = "📩 Ler última mensagem";
    button.style.position = "fixed";
    button.style.top = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "#25D366";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    document.body.appendChild(button);

    button.addEventListener("click", () => {
      const messages = document.querySelectorAll("div.message-in");
      if (!messages.length) {
        alert("❌ Nenhuma mensagem recebida encontrada.");
        return;
      }

      const last = messages[messages.length - 1];
      const textSpan = last.querySelector("span.selectable-text span");
      const message = textSpan?.innerText || "(sem texto)";
      alert("📨 Última mensagem recebida:\n\n" + message);
    });
  }

  waitForWhatsAppToLoad();
})();