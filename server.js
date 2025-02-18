const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
let games = {};
let currentGameId
let whoIsNext = 'blue'
let youAre = 'green'

app.use(express.static('public'));

//............ generate deck of cards:
function generateDeck() {
    const suits = ['h', 'd', 'c', 's'];
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '13', '14'];
    let deck = [];

    for (let suit of suits) {
        for (let value of values) {
            deck.push(`${suit}${value}`);
            deck.push(`${suit}${value}`);
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
    }
    return deck;
}


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createGame', () => {
        deck = generateDeck();
        let shuffledDeck = shuffleDeck(deck);
         gameId = Math.floor(1000 + Math.random() * 9000).toString();
        
        games[gameId] = { host: socket.id, players: [], deck: shuffledDeck};
        socket.join(gameId);
        socket.emit('gameCreated', gameId);
        console.log('Game created with ID:', gameId);
    });



    socket.on('joinGame', (gameId) => {
        const game = games[gameId];
        if (game && game.players.length < 2) {
            game.players.push(socket.id);
            socket.join(gameId);
                
            if (game.players.length === 1) {
               
                const half = Math.floor(game.deck.length / 2);
                const firstPlayerHand = game.deck.slice(0, half);
                game.deck = game.deck.slice(half); 
                io.to(socket.id).emit('dealCards', firstPlayerHand, 'green');
            } else if (game.players.length === 2) {
                const gameStarted = true;
                io.to(game.players[0]).emit('gameStarted', gameStarted);
                io.to(game.players[1]).emit('gameStarted', gameStarted);
               
                io.to(socket.id).emit('dealCards', game.deck, 'blue');
                game.deck = []; 
            }
    
            socket.emit('gameJoined', { gameId, playerIndex: game.players.length });
            io.to(game.host).emit('playerJoined', game.players.length);
            console.log(`Player ${game.players.length} joined game ${gameId}: ${socket.id}`);
        } else {
            socket.emit('joinError', 'Game not found or full');
        }
    });


    socket.on('cardDiscarded', ({ gameId, card, youAre }) => {
       whoIsNext = youAre === 'blue' ? 'green' : 'blue'
       const game = games[gameId];
       if (game) {
        io.to(game.host).emit('cardDiscarded', card, youAre, whoIsNext);
    }
});
       
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const [gameId, game] of Object.entries(games)) {
            if (game.host === socket.id || game.players.includes(socket.id)) {
                io.to(gameId).emit('gameEnded', 'Host or player disconnected');
                delete games[gameId];
                break;
            }
        }
    });
   
    socket.on('turnEnded', (gameId, youAre) => {
        const game = games[gameId];
        whoIsNext = youAre === 'blue' ? 'green' : 'blue'
        if (game) {
           io.to(game.host).emit('turnEnded')
           io.to(game.players[0]).emit('turnEnded', whoIsNext);
           io.to(game.players[1]).emit('turnEnded', whoIsNext);
        }
    });

    socket.on('oneLine', (player) => {
        const game = games[gameId];
        const recipient = player === 'green' ? game.players[0] : game.players[1]
        if (game) {
           io.to(recipient).emit('oneLine', player);
        } 
    }) 
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});