import { db, ref, onValue, set, get } from "./firebase.js";

// detecta em qual página o usuário está através dos elementos da tela
const tabelaIniciativa = document.getElementById("tabela-corpo");
const logIniciativas = document.getElementById("log-iniciativas");
const btnComprar = document.getElementById("btn-comprar-carta");
const areaCartas = document.getElementById("area-cartas-jogador");

// =========================================================================
// 🏰 CÓDIGO DA TELA DO MESTRE (salaMestre.html)
// =========================================================================
if (tabelaIniciativa || logIniciativas) {
  console.log("Painel do Mestre Inicializado");

  // Escuta o Firebase em tempo real para atualizar a mesa
  onValue(ref(db, "sala"), (snapshot) => {
    const dados = snapshot.val() || {};
    const iniciativas = dados.iniciativas || {};
    const logs = dados.logs || [];

    // 1. Atualiza a Tabela de Iniciativas Ativas (Ordenando do maior peso para o menor)
    if (tabelaIniciativa) {
      tabelaIniciativa.innerHTML = "";
      const listaOrdenada = Object.entries(iniciativas).sort((a, b) => {
        const pesoA = a[1].peso || 0;
        const pesoB = b[1].peso || 0;
        return pesoB - pesoA;
      });

      if (listaOrdenada.length === 0) {
        tabelaIniciativa.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#888;">Aguardando jogadas...</td></tr>`;
      } else {
        listaOrdenada.forEach(([nome, info]) => {
          const corNaipe = (info.naipe === '♥' || info.naipe === '♦') ? 'red' : 'black';
          const linha = `<tr>
            <td><strong>${nome}</strong></td>
            <td><span style="color: ${corNaipe}; font-weight: bold;">${info.valor || ''}${info.naipe || ''}</span></td>
          </tr>`;
          tabelaIniciativa.innerHTML += linha;
        });
      }
    }

    // 2. Atualiza o Histórico / Logs de jogadas no painel inferior
    if (logIniciativas) {
      logIniciativas.innerHTML = "";
      if (Array.isArray(logs)) {
        logs.forEach((txt) => {
          logIniciativas.innerHTML += `<p style="margin: 4px 0; border-bottom: 1px dashed #444; padding-bottom: 2px;">${txt}</p>`;
        });
      } else if (typeof logs === 'object') {
        Object.values(logs).forEach((txt) => {
          logIniciativas.innerHTML += `<p style="margin: 4px 0; border-bottom: 1px dashed #444; padding-bottom: 2px;">${txt}</p>`;
        });
      }
      // Auto-scroll para o último log enviado
      logIniciativas.scrollTop = logIniciativas.scrollHeight;
    }
  });

  // Configuração dos botões do Mestre (usando seletores flexíveis para evitar erros)
  document.addEventListener("click", async (e) => {
    // Botão Nova Rodada
    if (e.target && (e.target.id === "btn-nova-rodada" || e.target.innerText.includes("Nova Rodada"))) {
      try {
        await set(ref(db, "sala/iniciativas"), {});
        const snapLogs = await get(ref(db, "sala/logs"));
        let atualLogs = snapLogs.val();
        if (!Array.isArray(atualLogs)) atualLogs = atualLogs ? Object.values(atualLogs) : [];
        atualLogs.push("--- Nova Rodada Iniciada ---");
        await set(ref(db, "sala/logs"), atualLogs);
      } catch (err) {
        alert("Erro no Firebase: " + err.message);
      }
    }

    // Botão Limpar Tudo / Reset Total
    if (e.target && (e.target.id === "btn-limpar-tudo" || e.target.innerText.includes("Limpar"))) {
      if (confirm("Deseja resetar a mesa e o histórico inteiramente?")) {
        try {
          await set(ref(db, "sala"), {
            iniciativas: {},
            logs: ["Mesa reiniciada pelo mestre."]
          });
        } catch (err) {
          alert("Erro ao limpar: " + err.message);
        }
      }
    }
  });
}

// =========================================================================
// ⚔️ CÓDIGO DA TELA DO JOGADOR (salaJogador.html)
// =========================================================================
if (btnComprar || areaCartas) {
  console.log("Painel do Jogador Inicializado");
  
  const nomeJogador = localStorage.getItem("rpg_nome_jogador") || "Jogador";

  btnComprar?.addEventListener("click", async () => {
    btnComprar.disabled = true;
    btnComprar.innerText = "Puxando Carta...";

    try {
      // Lista de cartas para gerar uma puxada aleatória direta (substitui falhas do deck.js)
      const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      const naipes = ["♠", "♥", "♦", "♣"];
      const valorSorteado = valores[Math.floor(Math.random() * valores.length)];
      const naipeSorteado = naipes[Math.floor(Math.random() * naipes.length)];
      
      // Peso para ordenação na tabela do mestre
      const pesos = { "A": 14, "K": 13, "Q": 12, "J": 11, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2 };
      const pesoSorteado = pesos[valorSorteado] || 0;

      // 1. Envia a iniciativa do jogador para o banco
      await set(ref(db, `sala/iniciativas/${nomeJogador}`), {
        valor: valorSorteado,
        naipe: naipeSorteado,
        peso: pesoSorteado
      });

      // 2. Adiciona o evento no histórico de logs
      const snapLogs = await get(ref(db, "sala/logs"));
      let atualLogs = snapLogs.val();
      if (!Array.isArray(atualLogs)) atualLogs = atualLogs ? Object.values(atualLogs) : [];
      atualLogs.push(`${nomeJogador} puxou: ${valorSorteado} de ${naipeSorteado}`);
      await set(ref(db, "sala/logs"), atualLogs);

      // 3. Renderiza a carta na tela do celular do jogador
      if (areaCartas) {
        const corCard = (naipeSorteado === '♥' || naipeSorteado === '♦') ? 'red' : 'black';
        areaCartas.innerHTML = `
          <div style="border: 3px solid #444; padding: 25px; border-radius: 12px; background: #fff; width: 120px; margin: 15px auto; text-align: center; font-size: 24px; color: ${corCard}; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <div style="text-align: left; font-size: 16px;">${valorSorteado}</div>
            <div style="font-size: 45px; margin: 10px 0;">${naipeSorteado}</div>
            <div style="text-align: right; font-size: 16px; transform: rotate(180deg);">${valorSorteado}</div>
          </div>
        `;
      }

    } catch (error) {
      alert("Falha ao salvar jogada no Firebase: " + error.message);
    }

    btnComprar.disabled = false;
    btnComprar.innerText = "Comprar Carta";
  });
}

    listaOrdenada.forEach(([nome, info]) => {
      tabelaIniciativa.innerHTML += `
        <tr>
          <td><strong>${nome}</strong></td>
          <td style="color: ${
            info.naipe === "♥" || info.naipe === "♦" ? "red" : "black"
          }">
            ${info.valor}${info.naipe}
          </td>
        </tr>
      `;
    });
  });

  // 🔥 LOGS DO MESTRE (TEMPO REAL)
  onValue(ref(db, "sala/logs"), (snapshot) => {
    const logs = snapshot.val() || [];

    logIniciativas.innerHTML = "";
    logs.forEach((txt) => {
      logIniciativas.innerHTML += `<p>${txt}</p>`;
    });
  });

  /* =========================
     BOTÃO NOVA RODADA
  ========================= */
  document.getElementById("btn-nova-rodada")?.addEventListener("click", async () => {
    await set(ref(db, "sala/iniciativas"), {});
    
    const snap = await get(ref(db, "sala/logs"));
    const logs = snap.val() || [];

    logs.push("--- Nova Rodada Iniciada ---");
    await set(ref(db, "sala/logs"), logs);
  });

  /* =========================
     BOTÃO LIMPAR TUDO
  ========================= */
  document.getElementById("btn-limpar-tudo")?.addEventListener("click", async () => {
    if (confirm("Deseja resetar tudo?")) {
      await set(ref(db, "sala/iniciativas"), {});
      await set(ref(db, "sala/logs"), ["Mesa reiniciada pelo mestre."]);

      await reiniciarDeckFirebase();
    }
  });
}

/* =========================
   🃏 TELA DO JOGADOR
========================= */
if (campoJogador) {
  const nomeJogador =
    localStorage.getItem("rpg_nome_jogador") || "Jogador Anônimo";

  const btnComprar = document.getElementById("btn-comprar-carta");
  const areaCartas = document.getElementById("area-cartas-jogador");

  btnComprar?.addEventListener("click", async () => {
    btnComprar.disabled = true;
    btnComprar.innerText = "Puxando...";

    try {
      const carta = await comprarCartaFirebase();

      // 🔥 ENVIA INICIATIVA (FONTE ÚNICA)
      await set(ref(db, `sala/iniciativas/${nomeJogador}`), {
        valor: carta.valor,
        naipe: carta.naipe,
        peso: carta.peso
      });

      // 🔥 LOG GLOBAL
      const snapLogs = await get(ref(db, "sala/logs"));
      const logs = snapLogs.val() || [];

      logs.push(`${nomeJogador} puxou ${carta.valor} de ${carta.naipe}`);
      await set(ref(db, "sala/logs"), logs);

      // 🎴 MOSTRAR CARTA
      areaCartas.innerHTML = `
        <div class="carta-visual" style="
          border: 2px solid #ccc;
          padding: 20px;
          border-radius: 10px;
          background: white;
          width: 100px;
          text-align: center;
          font-size: 20px;
          color: ${
            carta.naipe === "♥" || carta.naipe === "♦" ? "red" : "black"
          }
        ">
          ${carta.valor}<br>${carta.naipe}
        </div>
      `;
    } catch (e) {
      alert("Erro ao comprar carta. O Mestre precisa reiniciar o deck.");
    }

    btnComprar.disabled = false;
    btnComprar.innerText = "Comprar Carta";
  });
}
  // Botão Nova Rodada
  document.getElementById("btn-nova-rodada")?.addEventListener("click", async () => {
    await set(ref(db, "sala/iniciativas"), {});
    const snapLogs = await get(ref(db, "sala/logs"));
    let atualLogs = snapLogs.val() || [];
    atualLogs.push("--- Nova Rodada Iniciada ---");
    await set(ref(db, "sala/logs"), atualLogs);
  });

  // Botão Limpar Tudo
  document.getElementById("btn-limpar-tudo")?.addEventListener("click", async () => {
    if (confirm("Deseja resetar a mesa inteira?")) {
      await set(ref(db, "sala/iniciativas"), {});
      await set(ref(db, "sala/logs"), ["Mesa reiniciada pelo mestre."]);
      await reiniciarDeckFirebase();
    }
  });
}

if (campoJogador) {
  // === LÓGICA DA TELA DO JOGADOR ===
  const nomeJogador = localStorage.getItem("rpg_nome_jogador") || "Jogador Anônimo";
  const btnComprar = document.getElementById("btn-comprar-carta");
  const areaCartas = document.getElementById("area-cartas-jogador");

  btnComprar?.addEventListener("click", async () => {
    btnComprar.disabled = true;
    btnComprar.innerText = "Puxando...";
    
    try {
      const carta = await comprarCartaFirebase();
      
      // Envia a jogada para a iniciativa do mestre automaticamente
      await set(ref(db, `sala/iniciativas/${nomeJogador}`), {
        valor: carta.valor,
        naipe: carta.naipe,
        peso: carta.peso
      });

      // Adiciona no histórico geral
      const snapLogs = await get(ref(db, "sala/logs"));
      let atualLogs = snapLogs.val() || [];
      atualLogs.push(`${nomeJogador} puxou um ${carta.valor} de ${carta.naipe}`);
      await set(ref(db, "sala/logs"), atualLogs);

      // Mostra a carta visualmente para o jogador
      areaCartas.innerHTML = `<div class="carta-visual" style="border: 2px solid #ccc; padding: 20px; border-radius: 10px; background: white; width: 100px; text-align: center; font-size: 20px; color: ${carta.naipe === '♥' || carta.naipe === '♦' ? 'red' : 'black'}">
        ${carta.valor}<br>${carta.naipe}
      </div>`;

    } catch (e) {
      alert("Erro ao comprar carta. O Mestre precisa reiniciar o deck.");
    }
    
    btnComprar.disabled = false;
    btnComprar.innerText = "Comprar Carta";
  });
}
const historicoIniciativaDiv = document.getElementById("historicoIniciativa");
if (historicoIniciativaDiv) {
  onValue(ref(db, "sala/historicoIniciativa"), (snapshot) => {
    historicoIniciativaDiv.innerHTML = "";
    if (snapshot.exists()) {
      const dados = snapshot.val();
      Object.values(dados).reverse().forEach(item => {
        historicoIniciativaDiv.innerHTML += `
          <div class="registroHistorico">
            <div class="infoHistorico">
              <i class="fa-solid fa-clock"></i>
              <span>${item.horario} - <b>${item.jogador}</b> tirou Iniciativa:</span>
            </div>
            <div class="cartaHistorico">${item.escolhida}</div>
          </div>`;
      });
    }
  });
}

// ===== ESCUTAR E ORDENAR TABELA DE INICIATIVA EM TEMPO REAL =====
const tabelaIniciativa = document.getElementById("tabelaIniciativa");
if (tabelaIniciativa) {
  onValue(ref(db, "sala/iniciativasAtuais"), (snapshot) => {
    tabelaIniciativa.innerHTML = "";
    if (snapshot.exists()) {
      const dados = Object.values(snapshot.val());
      dados.sort((a, b) => b.peso - a.peso);

      dados.forEach((item, index) => {
        tabelaIniciativa.innerHTML += `
          <div class="linhaIniciativa">
            <span class="nomeTabela"><b class="posicaoIniciativa">${index + 1}°</b> - ${item.jogador}</span>
            <span class="cartaTabela">${item.carta}</span>
          </div>`;
      });
    }
  });
}

// ===== BOTÕES DE CONTROLE EXCLUSIVOS DO MESTRE =====

// 1. Reiniciar apenas o deck (Embaralhar novo baralho)
const btnReiniciarDeckGeral = document.getElementById("limparHistoricoDeck"); // Mapeado para o id do botão do mestre
if(btnReiniciarDeckGeral) {
  btnReiniciarDeckGeral.addEventListener("click", () => {
    reiniciarDeckFirebase();
    alert("O Baralho foi reiniciado e embaralhado!");
  });
}

// 2. Nova Rodada (Limpa a tabela de iniciativas ativas para os jogadores jogarem de novo)
const botaoNovaRodada = document.getElementById("botaoNovaRodada");
if(botaoNovaRodada){
  botaoNovaRodada.addEventListener("click", () => {
    remove(ref(db, "sala/iniciativasAtuais"));
  });
}

// 3. Limpar Todo o Histórico (Reseta os logs das jogadas anteriores e limpa a mesa)
const botaoLimparTudo = document.getElementById("botaoLimparHistorico");
if(botaoLimparTudo){
  botaoLimparTudo.addEventListener("click", () => {
    remove(ref(db, "sala/historicoDeck"));
    remove(ref(db, "sala/historicoIniciativa"));
    remove(ref(db, "sala/iniciativasAtuais"));
    reiniciarDeckFirebase();
    alert("Toda a mesa e históricos foram limpos!");
  });
  }
