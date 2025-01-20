const socket = io();
let playerCards = []; 

const gameIdInput = document.getElementById('gameIdInput');
const joinGameBtn = document.getElementById('joinGameBtn');
const playerInfo = document.getElementById('playerInfo');
const cardsContainer = document.getElementById('playerCards');
const endTurnBtn = document.getElementById('endTurnBtn')

let gameId;
let playerIndex;
let youAre
let nextPlayer = 'green'
let gameStarted = false;
let canDiscard = false;

joinGameBtn.addEventListener('click', () => {
    const gameId = gameIdInput.value;
    socket.emit('joinGame', gameId);
});

socket.on('gameJoined', ({ gameId: joinedGameId, playerIndex }) => {
    youAre = playerIndex === 1 ? 'green' : 'blue';
    gameId = joinedGameId; 

    if (youAre === 'blue'){
        document.body.style.backgroundColor = 'rgb(9, 54, 68)'
        gameIdInput.style.boxShadow = '1px 1px 5px rgb(7, 191, 228)'
        gameIdInput.style.color = 'rgb(7, 191, 228)'
        endTurnBtn.style.visibility = 'hidden';
    } else {
            endTurnBtn.style.visibility = 'visible';
    }

    const firstRound = youAre === 'green' ? "You start. Play a card, then place your button on the board." : "Please wait for your opponent to start."
    playerInfo.textContent = `Welcome, ${youAre.toUpperCase()} PLAYER! ${firstRound}`;
    playerInfo.style.display = 'block';
});

socket.on('dealCards', (hand, player) => {
    playerCards = hand;
    youAre = player
    renderCards();
});


socket.on('gameStarted', (gStarted) => {
    if (gStarted) {
        gameStarted = true
        canDiscard = true
        document.getElementById('joinGameBtn').style.display = 'none'
    }
})


socket.on('turnEnded', whoIsNext =>{
    nextPlayer = whoIsNext
    endTurnBtn.style.visibility =  nextPlayer === youAre ? 'visible' : 'hidden';
    const nextTurnText = nextPlayer === youAre ? "It's your turn. Play a card, then place your button on the board." : "Please wait, it's your opponent's turn."
    playerInfo.textContent = nextTurnText
})

function renderCards() {
    cardsContainer.innerHTML = ''; 

    const visibleCards = playerCards.slice(0, 7); 

    visibleCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'playerCard';
        cardElement.id = `playerCard${index}`
        cardElement.addEventListener('click', () => {
           if (nextPlayer === youAre && gameStarted ) {
            discardCard(index);
           } 
        });
            cardElement.style.backgroundImage = `URL(images/${card}.png)`
            cardsContainer.appendChild(cardElement);
      });
}

function discardCard(cardIndex) {
    if (canDiscard){
      const discardedCard = playerCards[cardIndex];
      document.getElementById(`playerCard${cardIndex}`).style.backgroundImage = 'none'
      playerCards.splice(cardIndex, 1); 
      socket.emit('cardDiscarded', { gameId, card: discardedCard, youAre });
      canDiscard = false
     }
}

socket.on('joinError', (message) => {
    alert(message);
});

socket.on('gameEnded', (message) => {
    alert(message);
    location.reload();
});

function endTurn(){
    canDiscard = true
    socket.emit('turnEnded', gameId, youAre);
    renderCards();
}
