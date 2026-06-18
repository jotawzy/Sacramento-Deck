import { comprarCartaFirebase } from "./deck.js";
import { db, ref, push } from "./firebase.js";

export function gerarNaipes(carta){
  const quantidade = Number(carta.valor);
  let html = "";
  if(isNaN(quantidade)) return "";
  for(let i = 0; i < quantidade; i++){
    html += ` <span class="naipeCentro">${carta.naipe}</span> `;
  }
  return html;
}

export function gerarCentroCarta(carta){
  if(carta.valor === "A"){
    return `<div class="asCentro"><span class="asNaipe">${carta.naipe}</span></div>`;
  }
  if(carta.valor === "K"){
    return `<div class="figuraEspecial"><span class="iconeFigura">♚</span></div>`;
  }
  if(carta.valor === "Q"){
    return `<div class="figuraEspecial"><span class="iconeFigura">♛</span></div>`;
  }
  if(carta.valor === "J"){
    return `<div class="figuraEspecial"><span class="iconeFigura">♞</span></div>`;
  }
  return `<div class="numerosCentro numero${carta.valor}">${gerarNaipes(carta)}</div>`;
}

export function gerarCartaHTML(carta){
  return `
    <div class="cantoSuperior"><span>${carta.valor}</span><span>${carta.naipe}</span></div>
    <div class="centroCarta">${gerarCentroCarta(carta)}</div>
    <div class="cantoInferior"><span>${carta.valor}</span><span>${carta.naipe}</span></div>
  `;
}

const botaoComprar = document.getElementById("botaoComprar");
const areaCartas = document.getElementById("areaCartas");

if(botaoComprar){
  botaoComprar.addEventListener("click", async () => {
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
    areaCartas.appendChild(novaCarta);

    const horario = new Date().toLocaleTimeString();
    const nomeJogador = localStorage.getItem("nomeJogador") || "Jogador";
    
    push(ref(db, "sala/historicoDeck"), {
      jogador: nomeJogador,
      carta: carta.valor + carta.naipe,
      horario: horario
    });
  });
}
