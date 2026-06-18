# Sacramento Deck 🃏✨

O **Sacramento Deck** é uma ferramenta multiplayer em tempo real desenvolvida para mestres e jogadores de RPG de mesa. O sistema permite gerenciar um deck de cartas global de forma centralizada, histórico de puxadas e um sistema automatizado de iniciativas para organizar o combate ou a ordem das ações na mesa.

O projeto foi estruturado para ser leve, seguro e 100% estático, rodando diretamente do **GitHub Pages** com a sincronização de dados gerenciada pelo **Firebase Realtime Database**.

---

## 🚀 Funcionalidades

### 🏰 Painel do Mestre (`salaMestre.html`)
* **Histórico das Iniciativas:** Acompanha em tempo real qual carta cada jogador escolheu para a rodada.
* **Ordem da Rodada (Tabela de Iniciativa):** Organiza e ordena automaticamente os personagens do maior peso de carta para o menor.
* **Controle da Mesa:**
* * **Nova Rodada:** Limpa a tabela de iniciativas ativas para que os jogadores possam comprar novas cartas.
  * **Limpar Todo Histórico:** Reseta os logs de jogadas, limpa a mesa e reinicia o baralho central.

### ⚔️ Painel do Jogador (`salaJogador.html`)
* **Deck Livre:** Permite que o jogador compre cartas avulsas do baralho que aparecem com renderização visual fiel e estilizada.
* **Sistema de Iniciativas:** O jogador escolhe a quantidade de cartas que quer puxar da sua mão, visualiza as opções e clica na carta desejada para travar e enviar sua iniciativa automaticamente para o mestre.

### 🌐 Sincronização Multiplayer
* **Baralho Único Central:** Quando uma carta é puxada por qualquer jogador, ela é retirada do Firebase. Nenhum jogador consegue tirar a mesma carta na mesma rodada.
* **Atualização Instantânea:** Sem necessidade de dar F5. Ações tomadas no celular do jogador refletem na tela do mestre no mesmo segundo.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Estilização gótica/medieval com a fonte *Cinzel*) e JavaScript (ES6 Modules).
* **Banco de Dados em Tempo Real:** Firebase Realtime Database.
* **Hospedagem:** GitHub Pages.

---

## 📂 Estrutura do Projeto

```text
├── css/
│   ├── jogador.css      # Estilização das cartas, animações e painel do player
│   ├── mestre.css       # Layout das tabelas de iniciativa e logs do mestre
│   └── style.css        # Estilos globais e telas de login/entrada
├── js/
│   ├── app.js           # Escuta o Firebase em tempo real e atualiza as telas
│   ├── cartas.js        # Lógica de renderização visual e HTML das cartas
│   ├── deck.js          # Criação, embaralhamento e compra de cartas no Firebase
│   ├── firebase.js      # Inicialização e credenciais do Firebase
│   └── sala.js          # Validação de senhas e persistência do nome no LocalStorage
├── index.html           # Tela de boas-vindas / Seleção de função
├── mestre.html          # Login do Mestre
├── jogador.html         # Login do Jogador
├── salaMestre.html      # Painel de controle do Mestre
└── salaJogador.html     # Painel de ações do Jogador
