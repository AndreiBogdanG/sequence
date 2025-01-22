const jsConfetti = new JSConfetti()

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
const welcomeContainer = document.getElementById('welcomeContainer')
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
let availableCardsArray = []
let availableCirclesArray = []
let blueLines = 0
let greenLines = 0
let initialCardsArray = []
let currentPlayer 

const gameOverContainer = document.getElementById('gameOverContainer')
const newGameBtn = document.getElementById('newGameBtn')
const welcomeNewGameBtn = document.getElementById('welcome-newGameBtn')
const winnerPicDiv = document.getElementById('winnerPic')
let winnerPic


// CREATE QR
let currentURL = window.location.href;
if (currentURL.includes('localhost')){
    currentURL = 'http://192.168.0.129:3000/'   // when I play it on my laptop :)
}
const link = `https://api.qrserver.com/v1/create-qr-code/?data=${currentURL}player.html&size=100x100`
const qrLink = document.getElementById('qr-link')
const img = document.createElement('img');
img.src = link;
img.id="qrImage" 
img.alt="qr code"
qrLink.appendChild(img);


//pressing Escape closes the instructions window
const OnEscapePressed = (event) => event.key === 'Escape' && EscapePressed();
document.addEventListener('keydown', OnEscapePressed);
const EscapePressed = () => {
    helpContainer.style.visibility = "hidden"
};

function createCard(id) {
    const card = document.createElement('div');
    card.className = `card ${cardsOrder[id]}`;
    card.id = `card${id}`   
    card.style.backgroundImage = `URL(images/${cardsOrder[id]}.png)`
    card.dataset.colorIndex = 0; 
    card.innerHTML = `<div class="circle" id="circle${id}"></div>`;

    card.style.border = 'none'

   function handleCardClick(){

    const currentCircle = document.getElementById(`circle${id}`)
    const randomNumber = Math.floor(Math.random()*360)
    currentCircle.style.transform = `rotate(${randomNumber}deg)`
    const isOneEyedJack = (lastDiscarded === 'h12' || lastDiscarded === 's12')

    if (card.style.border === 'none'){
        return
       }

       isOneEyedJack ?  restoreCircles(availableCirclesArray) :  clearCircles(availableCirclesArray)

        if (isOneEyedJack)  {   
            currentCircle.classList.add('none')
            currentCircle.classList.remove(`blue`)
            currentCircle.classList.remove(`green`)
            currentCircle.classList.remove(`white`)

        } else if (currentCircle.className.includes('white')){ 
            
         currentCircle.classList.remove('white')
         currentCircle.classList.remove(`blue`)
         currentCircle.classList.remove(`green`)
         currentCircle.classList.add(`${colors[1]}`)

        }  
   } 

    card.addEventListener('click', () => {
        handleCardClick()

        setTimeout(() => {
            check5inARow();
        }, 150);
    });

    return card;
}

//render the cards on the board:
for (let i = 0; i < 100; i++) {
    const card = createCard(i);
    board.appendChild(card);    
}


// mark corners as green and blue, so they count for the winners
const cornersArray = ['circle0', 'circle9', 'circle90', 'circle99']
cornersArray.forEach(circle => {
    document.getElementById(circle).classList.add('green') 
    document.getElementById(circle).classList.add('blue') 
    document.getElementById(circle).classList.add('none') 
})

function clearCircles(arr){
    arr.forEach((circle, id) => {
        circle.classList.remove('green');
        circle.classList.remove('blue');  
        circle.classList.remove('none');  
        circle.classList.add('white')
   })
}

function restoreCircles(arr){
      arr.forEach((circle, id) => {
        const opponent = whoIsNext === 'green' ? 'green' : 'blue'
        circle.classList.remove('white');
        circle.classList.remove('none');  
        circle.classList.remove(`${whoIsNext}`);  

        circle.classList.add(`${opponent}`)
   })
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
    gameOverContainer.style.display = 'none'
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

const discardedCardsDiv = document.getElementById('discardedCards');
const discardedCardsContainer = document.getElementById('discardedCardsContainer');

socket.on('cardDiscarded', (card, youAre, next) => {
    availableCirclesArray=[]
    whoIsNext = next
    currentPlayer = youAre
    renderDiscardedCard(card);
    lastDiscarded = card;
    colors.pop()
    colors.push(youAre)
    showAvailableSpots(youAre);
});

function renderDiscardedCard(card) {
    discardedCardsDiv.style.backgroundImage = `URL(images/${card}.png)`
    discardedCardsContainer.style.backgroundColor = currentPlayer === 'green' ? ' rgb(9, 68, 9)' : 'rgb(9, 54, 68)'    
    cardsOrder.forEach((card, id) => {
        unmarkAvailable(id)
    })
}

function markAsAvailable(index){
    
   const card = document.getElementById(`card${index}`)
   const circle = document.getElementById(`circle${index}`)

   if (!circle.classList.contains('blocked')){
      card.style.border = '1px solid rgb(225, 255, 0)'
      card.style.boxShadow = '0 0 20px rgb(225, 255, 0)'
      circle.classList.add('white');   
      availableCirclesArray.push(circle)
      availableCardsArray.push(card)
   }        
}

function unmarkAvailable(index){
    const card = document.getElementById(`card${index}`)
    const circle = document.getElementById(`circle${index}`)
         card.style.border = 'none'
         circle.classList.remove('white');   
         card.style.boxShadow = 'none'
}

function hideAvailableSpots(){
    availableCirclesArray.forEach(circle => {
        circle.classList.remove('white'); 
        circle.classList.remove('none'); 
    })
    availableCardsArray.forEach(card => {
        card.style.border = 'none'
        card.style.boxShadow = 'none' 
    })
}

socket.on('turnEnded', () => {
    hideAvailableSpots()
})


function showAvailableSpots(youAre){
    const jack1 = (lastDiscarded ==='c12' || lastDiscarded === 'd12')
    const jack2 = (lastDiscarded ==='h12' || lastDiscarded === 's12')

     cardsOrder.forEach((card, id) =>{
        const circle = document.getElementById(`circle${id}`)
        const circleEmpty = !circle.classList.contains('green') && !circle.classList.contains('blue')
        const circleGreen = circle.classList.contains('green')
        const circleBlue = circle.classList.contains('blue')

        //any available space:
        if (jack1 && card !== 'back' && circleEmpty){
           markAsAvailable(id)
        } else 
        //space occupied by opponent:
        if (jack2 && card !== 'back'){
            if (youAre === 'green' && circleBlue){
               markAsAvailable(id)
            } else if (youAre === 'blue' && circleGreen){
               markAsAvailable(id)
            }
        } else 
      
         if (card === lastDiscarded && !circle.classList.contains('green') && !circle.classList.contains('blue')){
                markAsAvailable(id)  
            }
})}

//  check if there are winners part:

function createColorGrid(color) {  
    const grid = [];
    for (let row = 0; row < 10; row++) {
        const gridRow = [];
        for (let col = 0; col < 10; col++) {
            const index = row * 10 + col;
            const element = document.getElementById(`circle${index}`);

            if (element.className.includes(color)){
                gridRow.push(color);
            } else {
                gridRow.push(index)
            }
        }
        grid.push(gridRow);
    }
    return grid
    }

    function hasFiveConsecutive(grid) {
        const rows = 10; 
        const cols = 10;
    
        const directions = [
            { dr: 0, dc: 1 },  
            { dr: 1, dc: 0 },  
            { dr: 1, dc: 1 }, 
            { dr: 1, dc: -1 }  
        ];
    
        const result = {
            count: 0,
            indices: []
        };
    
        const visited = new Set(); 
    
        function getIndex(r, c) {
            return r * cols + c; 
        }
    
        function checkDirection(r, c, dr, dc) {
            const characteristic = grid[r][c];
            const lineIndices = [];
            let length = 0;
    
            while (
                r >= 0 && r < rows &&
                c >= 0 && c < cols &&
                grid[r][c] === characteristic
            ) {
                const index = getIndex(r, c);
                lineIndices.push(index);
                r += dr;
                c += dc;
                length++;
            }
    
            if (length >= 5) {
                if (lineIndices.some(index => !visited.has(index))) {
                    result.count++;
                    lineIndices.forEach(index => visited.add(index));
                    result.indices.push(...lineIndices);
                }
            }
        }
    
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] !== null) { // Check for a marker
                    for (const { dr, dc } of directions) {
                        const prevR = r - dr;
                        const prevC = c - dc;
    
                        // Ensure we start from the beginning of a sequence
                        if (
                            prevR < 0 || prevR >= rows ||
                            prevC < 0 || prevC >= cols ||
                            grid[prevR][prevC] !== grid[r][c]
                        ) {
                            checkDirection(r, c, dr, dc);
                        }
                    }
                }
            }
        }
    
        return result;
    }
    


function check5inARow(){
    const green = createColorGrid('green')
    const blue = createColorGrid('blue')
    const greenWins = hasFiveConsecutive(green)
    const blueWins = hasFiveConsecutive(blue)

    //add "blocked" class to blocked circle elements
    const blockedCircles = [...greenWins.indices, ...blueWins.indices]
    if (blockedCircles.length >=5){
        blockedCircles.forEach(index => {
            document.getElementById(`circle${index}`).classList.add('blocked')
        })
    }

    if (greenWins.count === 1 && greenLines === 0){
        hideAvailableSpots()
        alert('Green player has one line')
        socket.emit('oneLine', 'green');
        greenLines++
    } 

    if (greenWins.count === 2){
        hideAvailableSpots()
        alert('Green player wins with two lines!')
        displayWinner()
    }

    if (blueWins.count === 1 && blueLines === 0){
        hideAvailableSpots()
        alert('Blue player has one line')
        socket.emit('oneLine', 'blue');
        blueLines++
    } 

    if (blueWins.count === 2){
        hideAvailableSpots()
        alert('Blue player wins with two lines!')
        displayWinner()
    }
}


function displayWinner(){
    winnerPic = `images/${currentPlayer}Wins.jpg` 
    winnerPicDiv.src = winnerPic;
    gameOverContainer.style.display = 'flex'
    jsConfetti.addConfetti({
        emojis: ['🃏', '♥️', '♠️', '♣️', '♦️', '🂪', '🃁', '🂾'], confettiRadius: 6,
        confettiNumber: 100
     })
}

newGameBtn.addEventListener('click', () => {
    location.reload()
});

// document.addEventListener('click', () => {
//     welcomeContainer.style.visibility = 'hidden'
// })

function closePopup(){
    welcomeContainer.style.visibility = 'hidden' 
}
