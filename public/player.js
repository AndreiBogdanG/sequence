const socket = io();
let playerCards = []; 

const gameIdInput = document.getElementById('gameIdInput');
const joinGameBtn = document.getElementById('joinGameBtn');
const playerInfo = document.getElementById('playerInfo');
const cardsContainer = document.getElementById('playerCards');

let gameId;
let playerIndex;
let youAre
let nextPlayer = 'green'
let gameStarted = false;

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
       
    }

    const firstRound = youAre === 'green' ? "You start. Play a card, then place your button on the board." : "Please wait for your opponent to start."
    playerInfo.textContent = `Welcome, ${youAre.toUpperCase()} PLAYER! ${firstRound}`;
    playerInfo.style.display = 'block';
});

socket.on('dealCards', (hand) => {
    playerCards = hand;
    renderCards();
});

//=====================================

socket.on('gameStarted', (gStarted) => {
    if (gStarted) {
        gameStarted = true
    }

})

//=====================================


socket.on('cardDiscarded', ({whoIsNext}) => {
              nextPlayer = whoIsNext
              const nextTurnText = nextPlayer === youAre ? "It's your turn. Play a card, then place your button on the board." : "Please wait, it's your opponent's turn."
              playerInfo.textContent = nextTurnText
    });


function renderCards() {
    cardsContainer.innerHTML = ''; 

    const visibleCards = playerCards.slice(0, 7); 
    visibleCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'playerCard';
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
    const discardedCard = playerCards[cardIndex];
    playerCards.splice(cardIndex, 1); 
    renderCards();

    socket.emit('cardDiscarded', { gameId, card: discardedCard, youAre });
    
}

socket.on('joinError', (message) => {
    alert(message);
});

socket.on('gameEnded', (message) => {
    alert(message);
    location.reload();
});
