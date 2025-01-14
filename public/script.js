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

function createCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundImage = `URL(images/${cardsOrder[id]}.png)`
    card.dataset.colorIndex = 0; // Tracks the current color index
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
