import { db, ref, onValue, remove } from "./firebase.js";
import { reiniciarDeckFirebase } from "./deck.js";

// ===== IDENTIDADE DO TOPO =====
const nomeJogadorTopo = document.getElementById("nomeJogadorTopo");
if (nomeJogadorTopo) {
  const nome = localStorage.getItem("nomeJogador") || "Jogador";
  nomeJogadorTopo.innerHTML = ' <i class="fa-solid fa-user"></i> ' + nome;
}
const nomeMestreTopo = document.getElementById("nomeMestreTopo");
if (nomeMestreTopo) {
  nomeMestreTopo.innerHTML = ' <i class="fa-solid fa-crown"></i> Mestre';
}

// ===== ESCUTAR HISTÓRICO DO DECK EM TEMPO REAL =====
const historicoDeckDiv = document.getElementById("historicoDeck");
if (historicoDeckDiv) {
  onValue(ref(db, "sala/historicoDeck"), (snapshot) => {
    historicoDeckDiv.innerHTML = "";
    if (snapshot.exists()) {
      const dados = snapshot.val();
      Object.values(dados).reverse().forEach(item => {
        historicoDeckDiv.innerHTML += `
          <div class="registroHistorico">
            <div class="infoHistorico">
              <i class="fa-solid fa-clock"></i>
              <span>${item.horario} - <b>${item.jogador}</b> puxou:</span>
            </div>
            <div class="cartaHistorico">${item.carta}</div>
          </div>`;
      });
    }
  });
}

// ===== ESCUTAR HISTÓRICO DA INICIATIVA EM TEMPO REAL =====
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
