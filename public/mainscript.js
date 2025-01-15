const board = document.getElementById('board');
const colors = ['none', 'green'];
const cardsOrder = [
    'back', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'back',
    'c6', 'c5', 'c4', 'c3', 'c2', 'h1', 'h14', 'h13', 'h10', 's10',
    'c7', 's1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'h9', 's13',
    'c8', 's14', 'c6', 'c5', 'c4', 'c3', 'c2', 'd8', 'h8', 's14',
    'c9', 's13', 'c7', 'h6', 'h5', 'h4', 'h1', 'd9', 'h7', 's1',
    'c10', 's10', 'c8', 'h7', 'h2', 'h3', 'h14', 'd10', 'h6', 'd2',
    'c13', 's9', 'c9', 'h8', 'h9', 'h10', 'h13', 'd13', 'h5', 'd3',
    'c14', 's8', 'c10', 'c13', 'c14', 'c1', 'd1', 'd14', 'h4', 'd4', 
    'c1', 's7', 's6', 's5', 's4', 's3', 's2', 'h2', 'h3', 'd5', 
    'back', 'd1', 'd14', 'd13', 'd10', 'd9', 'd8', 'd7', 'd6', 'back'
    ]

const playerDiv = document.getElementById('heldCards')
let heldCards = []
let helpOn = false
const helpContainer = document.getElementById('helpContainer')
const helpText = document.getElementById('helpText')
helpText.innerHTML = `
                <span class='bold larger'>New Game:</span><br> Press the "Create Game" button, then use the QR code to connect two phones. Enter the Game ID on the phones.
                <hr>
                <span class='bold larger'>Objective</span><br>
                Be the first player to create two sequences of five consecutive markers in a row, column, or diagonal on the game board.<hr>
                <span class='bold larger'>How to Play</span><br>
                <span class='bold'>1.	Take Turns</span><br>
                Players alternate turns. The youngest player starts.<br>
                <span class='bold'>2.	Play a Card</span><br>
                <hr>
                <span class='bold'>On your turn:</span><br>
                <tab>•	Choose a card from your hand to discard.<br>
                •	Place a marker on the corresponding card space on the board.<br>
                •	After playing, a new card is automatically drawn from the deck to maintain 7 cards in your hand.<br>
                <span class='bold'>3.	Wild Cards</span><br>
                •	Jacks with two visible eyes (J♣, J♦): Place a marker on any open space.<br>
                •	Jacks with one visible eye (J♠, J♥): Remove an opponent’s marker (not part of a completed sequence).<br>
                <span class='bold'>4.	Corner Spaces</span><br>
                The corner spaces are wild and count as part of any sequence. No marker is needed to claim them.<br>
                <hr>
                <span class='bold'>Rules</span><br>
                •	You cannot place a marker on a space that is already occupied.<br>
                •	You must play a valid card; if you cannot, discard and draw a new card.<br>
                <hr>
                <span class='bold'>Winning</span><br>
                The first player to create two sequences (five markers in a row, column, or diagonal) wins!<br>
                If the draw pile runs out and no player has won, the game ends in a tie.
                `
const mainContainer = document.getElementById('main-container')
const initialContainerPosition = mainContainer.style.position

const socket = io();

const createGameBtn = document.getElementById('createGameBtn');
const gameIdDisplay = document.getElementById('gameIdDisplay');
const waitingForPlayers = document.getElementById('waitingForPlayers');
const gameIdSpan = document.getElementById('gameId');
let lastDiscarded  
let whoIsNext = 'green'



function createCard(id) {
    const card = document.createElement('div');
    card.className = `card ${cardsOrder[id]}`;
    card.style.backgroundImage = `URL(images/${cardsOrder[id]}.png)`
    card.dataset.colorIndex = 0; 
    card.innerHTML = '<div class="circle"></div>';

    card.addEventListener('click', () => {
        let conditions = true;
        let currentIndex = parseInt(card.dataset.colorIndex);
        const circle = card.querySelector('.circle');
        //does the discarded card equal the clicked card? Is the clicked card occupied by opponent? Is it a corner?
        if (cardsOrder[id] !== lastDiscarded || 
                  (currentIndex !== 0 && !circle.className.includes(colors[currentIndex]))  
        ){
            conditions = false
        }

        if (conditions || (['d12', 'c12', 's12', 'h12'].includes(lastDiscarded) && cardsOrder[id] !== "back")) {

        currentIndex = (currentIndex + 1) % colors.length;
        card.dataset.colorIndex = currentIndex;

        circle.className = 'circle'; 
        if (colors[currentIndex] !== 'none') {
            circle.classList.add(colors[currentIndex]);
        }
    }
    });

    return card;
}

for (let i = 0; i < 100; i++) {
    const card = createCard(i);
    board.appendChild(card);
}

function toggleHelp(){
    helpOn = !helpOn
    if (helpOn) {
        helpContainer.style.visibility = "visible"
        mainContainer.style.position = "fixed"
    } else {
        helpContainer.style.visibility = "hidden"
        mainContainer.style.position = initialContainerPosition
    }
}


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
    if (playerCount===2){
        waitingForPlayers.textContent = `Both players are online; game started.`
    }
});

socket.on('gameEnded', (message) => {
    alert(message);
    location.reload();
});

const discardedCardsContainer = document.getElementById('discardedCards');

socket.on('cardDiscarded', (card, youAre, whoIsNext) => {
        
    whoIsNext = whoIsNext
    renderDiscardedCard(card);
    lastDiscarded = card;
    colors.pop()
    colors.push(youAre)
});

function renderDiscardedCard(card) {
    discardedCardsContainer.style.backgroundImage = `URL(images/${card}.png)`
}