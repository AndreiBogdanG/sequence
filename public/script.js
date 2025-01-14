const board = document.getElementById('board');
const colors = ['none', 'green', 'blue'];
const cardsOrder = [
    'none', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'none',
    'c6', 'c5', 'c4', 'c3', 'c2', 'h1', 'h14', 'h13', 'h10', 's10',
    'c7', 's1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'h9', 's13',
    'c8', 's14', 'c6', 'c5', 'c4', 'c3', 'c2', 'd8', 'h8', 's14',
    'c9', 's13', 'c7', 'h6', 'h5', 'h4', 'h1', 'd9', 'h7', 's1',
    'c10', 's10', 'c9', 'h7', 'h2', 'h3', 'h14', 'd10', 'h6', 'd2',
    'c13', 's9', 'c9', 'h8', 'h9', 'h10', 'h13', 'd13', 'h5', 'd3',
    'c14', 's8', 'c10', 'c13', 'c14', 'c1', 'd1', 'd14', 'h4', 'd4', 
    'c1', 's7', 's6', 's5', 's4', 's3', 's2', 'h2', 'h3', 'd5', 
    'none', 'd1', 'd14', 'd13', 'd10', 'd9', 'd8', 'd7', 'd6', 'none'
    ]
const playerDiv = document.getElementById('heldCards')
let heldCards = []
let helpOn = false
const helpContainer = document.getElementById('helpContainer')
const helpText = document.getElementById('helpText')
const mainContainer = document.getElementById('main-container')
const initialContainerPosition = mainContainer.style.position


function createCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundImage = `URL(images/${cardsOrder[id]}.png)`
    card.dataset.colorIndex = 0; 
    card.innerHTML = '<div class="circle"></div>';

    card.addEventListener('click', () => {
        const circle = card.querySelector('.circle');
        let currentIndex = parseInt(card.dataset.colorIndex);
        currentIndex = (currentIndex + 1) % colors.length;
        card.dataset.colorIndex = currentIndex;

        circle.className = 'circle'; // Reset class
        if (colors[currentIndex] !== 'none') {
            circle.classList.add(colors[currentIndex]);
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