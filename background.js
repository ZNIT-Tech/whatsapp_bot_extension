// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getClientes") {
    fetch("https://api.znit.ai/contas/ativas", {
      method: "GET",
      headers: {
        "Authorization": "q9c8Lk3aN3MtRl1w7a0eFaGYn2P3Ft1DbqW9xQtx6YU", // Substitua pelo seu token real
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => {
      console.error("Erro no background:", err);
      sendResponse({ success: false, error: err.message });
    });

    return true; // Mantém o canal aberto para o sendResponse async
  }
});