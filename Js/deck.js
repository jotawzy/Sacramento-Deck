import { db, ref, set, get } from "./firebase.js";

export const naipes = [ "♠", "♥", "♦", "♣" ];
export const valores = [
  { valor:"A", peso:14 }, { valor:"K", peso:13 }, { valor:"Q", peso:12 }, { valor:"J", peso:11 },
  { valor:"10", peso:10 }, { valor:"9", peso:9 }, { valor:"8", peso:8 }, { valor:"7", peso:7 },
  { valor:"6", peso:6 }, { valor:"5", peso:5 }, { valor:"4", peso:4 }, { valor:"3", peso:3 }, { valor:"2", peso:2 }
];

// Cria e embaralha o deck diretamente no Firebase
export async function reiniciarDeckFirebase() {
  let novoDeck = [];
  for(let naipe of naipes){
    for(let carta of valores){
      novoDeck.push({ valor: carta.valor, peso: carta.peso, naipe: naipe });
    }
  }
  // Embaralhar Deck
  for( let i = novoDeck.length - 1; i > 0; i-- ){
    const j = Math.floor( Math.random() * (i + 1) );
    [novoDeck[i], novoDeck[j]] = [novoDeck[j], novoDeck[i]];
  }
  
  await set(ref(db, "sala/deck"), novoDeck);
  return novoDeck;
}

// Compra uma carta (e cria o deck automaticamente caso ele não exista no Firebase)
export async function comprarCartaFirebase() {
  const deckRef = ref(db, "sala/deck");
  let snapshot = await get(deckRef);
  
  let atualDeck;

  // Se o deck não existir no Firebase (primeira jogada da mesa), cria um automaticamente
  if (!snapshot.exists()) {
    atualDeck = await reiniciarDeckFirebase();
  } else {
    atualDeck = snapshot.val();
  }
  
  // Se o baralho acabar durante o jogo, reinicia automaticamente também
  if (!atualDeck || atualDeck.length === 0) {
    atualDeck = await reiniciarDeckFirebase();
  }
  
  // Remove a carta do topo
  const cartaComprada = atualDeck.pop();
  
  // Atualiza o deck restante no Firebase
  await set(deckRef, atualDeck);
  return cartaComprada;
}
