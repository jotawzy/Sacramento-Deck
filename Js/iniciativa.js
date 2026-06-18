import { comprarCartaFirebase } from "./deck.js";
import { gerarCartaHTML } from "./cartas.js";
import { db, ref, push } from "./firebase.js";

let iniciativaTravada = false;
const botaoIniciativa = document.getElementById("botaoIniciativa");
const botaoDeck = document.getElementById("botaoDeck");
const deckLivre = document.getElementById("deckLivre");
const painelIniciativa = document.getElementById("painelIniciativa");
const botaoIniciativaComprar = document.getElementById("botaoIniciativaComprar");
const quantidadeCartas = document.getElementById("quantidadeCartas");
const cartasIniciativa = document.getElementById("cartasIniciativa");

if(botaoDeck){
  botaoDeck.addEventListener("click", () => {
    deckLivre.style.display = "block";
    painelIniciativa.style.display = "none";
  });
}

if(botaoIniciativa){
  botaoIniciativa.addEventListener("click", () => {
    deckLivre.style.display = "none";
    painelIniciativa.style.display = "block";
  });
}

if(botaoIniciativaComprar){
  botaoIniciativaComprar.addEventListener("click", async () => {
    if(iniciativaTravada){
      alert("Você já escolheu sua iniciativa nesta rodada.");
      return;
    }
    cartasIniciativa.innerHTML = "";
    const quantidade = Number(quantidadeCartas.value) || 1;

    for(let i = 0; i < quantidade; i++){
      const carta = await comprarCartaFirebase();
      if(!carta) return;

      const novaCarta = document.createElement("div");
      novaCarta.classList.add("cartaExemplo");
      if( carta.naipe === "♥" || carta.naipe === "♦" ){
        novaCarta.classList.add("cartaVermelha");
      } else {
        novaCarta.classList.add("cartaPreta");
      }
      novaCarta.innerHTML = gerarCartaHTML(carta);

      novaCarta.addEventListener("click", () => {
        if(iniciativaTravada) return;
        iniciativaTravada = true;

        const nomeJogador = localStorage.getItem("nomeJogador") || "Jogador";
        const horario = new Date().toLocaleTimeString();

        push(ref(db, "sala/historicoIniciativa"), {
          jogador: nomeJogador,
          escolhida: carta.valor + carta.naipe,
          horario: horario
        });

        push(ref(db, "sala/iniciativasAtuais"), {
          jogador: nomeJogador,
          carta: carta.valor + carta.naipe,
          peso: carta.peso
        });

        const todasCartas = document.querySelectorAll("#cartasIniciativa .cartaExemplo");
        todasCartas.forEach(c => c.classList.add("cartaApagada"));
        novaCarta.classList.remove("cartaApagada");
        novaCarta.classList.add("cartaSelecionada");
      });

      cartasIniciativa.appendChild(novaCarta);
    }
  });
}

// Escuta quando o mestre limpa a rodada para liberar o botão de comprar iniciativa novamente
import { onValue } from "./firebase.js";
onValue(ref(db, "sala/iniciativasAtuais"), (snapshot) => {
  if (!snapshot.exists()) {
    iniciativaTravada = false;
    if (cartasIniciativa) cartasIniciativa.innerHTML = "";
  }
});
