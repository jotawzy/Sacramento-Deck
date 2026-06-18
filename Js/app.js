import {
  db,
  ref,
  onValue,
  set,
  get,
  remove
} from "./firebase.js";

import {
  comprarCartaFirebase,
  reiniciarDeckFirebase
} from "./deck.js";

/* =========================
   IDENTIFICA TELA
========================= */
const campoMestre = document.getElementById("log-iniciativas");
const campoJogador = document.getElementById("area-cartas-jogador");

/* =========================
   🔥 TELA DO MESTRE
========================= */
if (campoMestre) {
  const tabelaIniciativa = document.getElementById("tabela-corpo");
  const logIniciativas = document.getElementById("log-iniciativas");

  // 🔴 ÚNICO LISTENER (FONTE DA VERDADE)
  onValue(ref(db, "sala/iniciativas"), (snapshot) => {
    const dados = snapshot.val() || {};

    tabelaIniciativa.innerHTML = "";

    const listaOrdenada = Object.entries(dados).sort(
      (a, b) => (b[1]?.peso || 0) - (a[1]?.peso || 0)
    );

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
