const socket = io();
let playerCards = []; 

const gameIdInput = document.getElementById('gameIdInput');
const joinGameBtn = document.getElementById('joinGameBtn');
const playerInfo = document.getElementById('playerInfo');
const cardsContainer = document.getElementById('playerCards');
let gameId;

joinGameBtn.addEventListener('click', () => {
    const gameId = gameIdInput.value;
    socket.emit('joinGame', gameId);
});

socket.on('gameJoined', ({ gameId: joinedGameId, playerIndex }) => {
    gameId = joinedGameId; 
    playerInfo.textContent = `You joined Game ${gameId} as Player ${playerIndex}`;
    playerInfo.style.display = 'block';
});

socket.on('dealCards', (hand) => {
    playerCards = hand; 
    renderCards();
});

function renderCards() {
    cardsContainer.innerHTML = ''; 

    const visibleCards = playerCards.slice(0, 7); 
    visibleCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'playerCard';
        cardElement.addEventListener('click', () => {
            discardCard(index);
        });
        cardElement.style.backgroundImage = `URL(images/${card}.png)`
        cardsContainer.appendChild(cardElement);
    });
}

function discardCard(cardIndex) {
    const discardedCard = playerCards[cardIndex];
    playerCards.splice(cardIndex, 1); 
    renderCards();
    socket.emit('cardDiscarded', { gameId, card: discardedCard });
}

socket.on('joinError', (message) => {
    alert(message);
});

socket.on('gameEnded', (message) => {
    alert(message);
    location.reload();
});
