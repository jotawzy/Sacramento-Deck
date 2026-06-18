import { db, ref, onValue, set, get } from "./firebase.js";
import { comprarCartaFirebase, reiniciarDeckFirebase } from "./deck.js";

// Verifica em qual tela estamos para rodar o código certo
const campoMestre = document.getElementById("log-iniciativas");
const campoJogador = document.getElementById("area-cartas-jogador");

if (campoMestre) {
  // === LÓGICA DA TELA DO MESTRE ===
  const tabelaIniciativa = document.getElementById("tabela-corpo");
  const logIniciativas = document.getElementById("log-iniciativas");

  // Escuta o Firebase em tempo real
  onValue(ref(db, "sala"), (snapshot) => {
    const dados = snapshot.val() || {};
    const iniciativas = dados.iniciativas || {};
    const logs = dados.logs || [];

    // 1. Atualiza a Tabela de Iniciativa (Ordenada por peso da carta)
    tabelaIniciativa.innerHTML = "";
    const listaOrdenada = Object.entries(iniciativas).sort((a, b) => b[1].peso - a[1].peso);
    
    listaOrdenada.forEach(([nome, info]) => {
      const linha = `<tr>
        <td><strong>${nome}</strong></td>
        <td><span style="color: ${info.naipe === '♥' || info.naipe === '♦' ? 'red' : 'black'}">${info.valor}${info.naipe}</span></td>
      </tr>`;
      tabelaIniciativa.innerHTML += linha;
    });

    // 2. Atualiza o Histórico/Log de jogadas
    logIniciativas.innerHTML = "";
    logs.forEach((txt) => {
      logIniciativas.innerHTML += `<p>${txt}</p>`;
    });
  });

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
