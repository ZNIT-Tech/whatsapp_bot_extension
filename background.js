// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getClientes") {
    fetch("https://api.znit.ai/contas_ativas")
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => {
        console.error("Erro no background:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Mantém o canal aberto para o sendResponse async
  }
});
