const socket = io();

const createGameBtn = document.getElementById('createGameBtn');
const gameIdDisplay = document.getElementById('gameIdDisplay');
const waitingForPlayers = document.getElementById('waitingForPlayers');
const gameIdSpan = document.getElementById('gameId');

createGameBtn.addEventListener('click', () => {
    socket.emit('createGame');
});

socket.on('gameCreated', (gameId) => {
    gameIdSpan.textContent = gameId;
    gameIdDisplay.style.display = 'block';
    waitingForPlayers.style.display = 'block';
});

socket.on('playerJoined', (playerCount) => {
    waitingForPlayers.textContent = `Waiting for players... (${playerCount}/2 joined)`;
});

socket.on('gameEnded', (message) => {
    alert(message);
    location.reload();
});

const discardedCardsContainer = document.getElementById('discardedCards');

socket.on('cardDiscarded', (card) => {
    console.log('ghghm')
    renderDiscardedCard(card);
});

function renderDiscardedCard(card) {
    discardedCardsContainer.style.backgroundImage = `URL(images/${card}.png)`
}