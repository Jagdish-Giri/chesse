// ==================== CHESS GAME ENGINE ====================
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameMode = 'pvp'; // pvp or pva
        this.aiDifficulty = 'medium';
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.gameStatus = 'playing';
        this.soundEnabled = true;
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.isBoardLocked = false;

        // Piece values for AI
        this.pieceValues = {
            'p': 1,
            'n': 3,
            'b': 3,
            'r': 5,
            'q': 9,
            'k': 0
        };
    }

    // Initialize chess board with standard starting position
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up pieces
        const setupRow = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        
        // Black pieces
        for (let i = 0; i < 8; i++) {
            board[0][i] = setupRow[i];
            board[1][i] = 'p';
        }
        
        // White pieces
        for (let i = 0; i < 8; i++) {
            board[6][i] = 'P';
            board[7][i] = setupRow[i].toUpperCase();
        }
        
        return board;
    }

    // Get piece at position
    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    // Check if piece belongs to player
    isPlayerPiece(piece, player) {
        if (!piece) return false;
        return player === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
    }

    // Get all valid moves for a piece
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const type = piece.toLowerCase();

        switch (type) {
            case 'p':
                this.getPawnMoves(row, col, piece, moves);
                break;
            case 'n':
                this.getKnightMoves(row, col, piece, moves);
                break;
            case 'b':
                this.getBishopMoves(row, col, piece, moves);
                break;
            case 'r':
                this.getRookMoves(row, col, piece, moves);
                break;
            case 'q':
                this.getQueenMoves(row, col, piece, moves);
                break;
            case 'k':
                this.getKingMoves(row, col, piece, moves);
                break;
        }

        return moves;
    }

    // Pawn moves
    getPawnMoves(row, col, piece, moves) {
        const direction = piece === 'P' ? -1 : 1;
        const startRow = piece === 'P' ? 6 : 1;

        // Move forward
        const nextRow = row + direction;
        if (nextRow >= 0 && nextRow <= 7 && !this.board[nextRow][col]) {
            moves.push([nextRow, col]);

            // Double move from start
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Captures
        for (let newCol of [col - 1, col + 1]) {
            if (newCol >= 0 && newCol <= 7) {
                const captureRow = row + direction;
                if (captureRow >= 0 && captureRow <= 7) {
                    const target = this.board[captureRow][newCol];
                    if (target && this.isPlayerPiece(target, piece === 'P' ? 'black' : 'white')) {
                        moves.push([captureRow, newCol]);
                    }
                }
            }
        }
    }

    // Knight moves
    getKnightMoves(row, col, piece, moves) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (let [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                const target = this.board[newRow][newCol];
                if (!target || !this.isPlayerPiece(target, piece === 'N' ? 'white' : 'black')) {
                    moves.push([newRow, newCol]);
                }
            }
        }
    }

    // Bishop moves
    getBishopMoves(row, col, piece, moves) {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        this.getSlidingMoves(row, col, piece, directions, moves);
    }

    // Rook moves
    getRookMoves(row, col, piece, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        this.getSlidingMoves(row, col, piece, directions, moves);
    }

    // Queen moves
    getQueenMoves(row, col, piece, moves) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        this.getSlidingMoves(row, col, piece, directions, moves);
    }

    // Sliding moves helper
    getSlidingMoves(row, col, piece, directions, moves) {
        for (let [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;

            while (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                const target = this.board[newRow][newCol];

                if (!target) {
                    moves.push([newRow, newCol]);
                } else {
                    if (!this.isPlayerPiece(target, piece === piece.toUpperCase() ? 'white' : 'black')) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }

                newRow += dRow;
                newCol += dCol;
            }
        }
    }

    // King moves
    getKingMoves(row, col, piece, moves) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                const target = this.board[newRow][newCol];
                if (!target || !this.isPlayerPiece(target, piece === 'K' ? 'white' : 'black')) {
                    moves.push([newRow, newCol]);
                }
            }
        }
    }

    // Make a move
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const target = this.board[toRow][toCol];

        // Capture piece
        if (target) {
            this.capturedPieces[this.currentPlayer].push(target);
            this.playSound('captureSound');
        } else {
            this.playSound('moveSound');
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Store move in history
        const move = {
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            captured: target,
            moveNumber: Math.ceil((this.moveHistory.length + 1) / 2)
        };
        this.moveHistory.push(move);
        this.lastMove = move;

        // Check for check
        if (this.isInCheck(this.currentPlayer === 'white' ? 'black' : 'white')) {
            this.playSound('checkSound');
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        return true;
    }

    // Check if king is in check
    isInCheck(player) {
        const king = player === 'white' ? 'K' : 'k';
        let kingPos = null;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === king) {
                    kingPos = [row, col];
                    break;
                }
            }
            if (kingPos) break;
        }

        if (!kingPos) return false;

        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && !this.isPlayerPiece(piece, player)) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.some(move => move[0] === kingPos[0] && move[1] === kingPos[1])) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Check if player has valid moves
    hasValidMoves(player) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isPlayerPiece(piece, player)) {
                    if (this.getValidMoves(row, col).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // AI Move
    makeAIMove() {
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return false;

        let bestMove;
        if (this.aiDifficulty === 'easy') {
            bestMove = moves[Math.floor(Math.random() * moves.length)];
        } else if (this.aiDifficulty === 'medium') {
            bestMove = this.getMediumAIMove(moves);
        } else {
            bestMove = this.getHardAIMove(moves);
        }

        return this.makeMove(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
    }

    // Get all valid moves for a player
    getAllValidMoves(player) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isPlayerPiece(piece, player)) {
                    const pieceMoves = this.getValidMoves(row, col);
                    for (let move of pieceMoves) {
                        moves.push({
                            from: [row, col],
                            to: move,
                            piece: piece
                        });
                    }
                }
            }
        }
        return moves;
    }

    // Medium AI - Random + some capture preference
    getMediumAIMove(moves) {
        const captureMoves = moves.filter(m => this.board[m.to[0]][m.to[1]]);
        
        if (captureMoves.length > 0 && Math.random() > 0.5) {
            return captureMoves[Math.floor(Math.random() * captureMoves.length)];
        }
        
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Hard AI - Minimax with evaluation
    getHardAIMove(moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (let move of moves.slice(0, Math.min(moves.length, 20))) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Evaluate a move
    evaluateMove(move) {
        let score = 0;
        const target = this.board[move.to[0]][move.to[1]];

        // Capture value
        if (target) {
            score += this.pieceValues[target.toLowerCase()] * 10;
        }

        // Piece development
        const piece = move.piece.toLowerCase();
        const distance = Math.abs(move.to[0] - 3.5) + Math.abs(move.to[1] - 3.5);
        score += (distance / 7) * 5;

        // Random for variety
        score += Math.random() * 5;

        return score;
    }

    // Undo last move
    undoMove() {
        if (this.moveHistory.length === 0) return false;

        const move = this.moveHistory.pop();
        
        // Restore piece
        this.board[move.from[0]][move.from[1]] = move.piece;
        this.board[move.to[0]][move.to[1]] = move.captured || null;

        // Remove from captured
        if (move.captured) {
            this.capturedPieces[this.currentPlayer === 'white' ? 'black' : 'white'].pop();
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        return true;
    }

    // Reset game
    reset() {
        this.board = this.initializeBoard();
        this.selectedSquare = null;
        this.validMoves = [];
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.gameStatus = 'playing';
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.isBoardLocked = false;
    }

    // Play sound
    playSound(soundId) {
        if (!this.soundEnabled) return;
        const audio = document.getElementById(soundId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    // Piece count
    getCapturedCount(player) {
        return this.capturedPieces[player].reduce((sum, p) => sum + (this.pieceValues[p.toLowerCase()] || 0), 0);
    }
}

// ==================== UI MANAGER ====================
class UIManager {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('chessboard');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('playerVsPlayerBtn').addEventListener('click', () => this.setGameMode('pvp'));
        document.getElementById('playerVsAIBtn').addEventListener('click', () => this.setGameMode('pva'));
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.game.aiDifficulty = e.target.value;
        });

        // Hide loader after 2.5 seconds
        setTimeout(() => {
            document.getElementById('loaderContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            this.renderBoard();
        }, 2500);
    }

    setGameMode(mode) {
        this.game.gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'pvp') {
            document.getElementById('playerVsPlayerBtn').classList.add('active');
            document.getElementById('difficultySelector').style.display = 'none';
            document.getElementById('gameModeDisplay').textContent = 'Player vs Player';
        } else {
            document.getElementById('playerVsAIBtn').classList.add('active');
            document.getElementById('difficultySelector').style.display = 'flex';
            document.getElementById('gameModeDisplay').textContent = 'Player vs AI';
        }

        this.resetGame();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;

                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                // Highlight last move
                if (this.game.lastMove) {
                    if ((row === this.game.lastMove.from[0] && col === this.game.lastMove.from[1]) ||
                        (row === this.game.lastMove.to[0] && col === this.game.lastMove.to[1])) {
                        square.classList.add('last-move');
                    }
                }

                // Highlight selected square
                if (this.game.selectedSquare && row === this.game.selectedSquare[0] && col === this.game.selectedSquare[1]) {
                    square.classList.add('selected');
                }

                // Highlight valid moves
                for (let move of this.game.validMoves) {
                    if (row === move[0] && col === move[1]) {
                        square.classList.add('highlighted');
                    }
                }

                const piece = this.game.getPiece(row, col);
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceUnicode(piece);
                    pieceElement.draggable = true;
                    pieceElement.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                square.addEventListener('dragover', (e) => this.handleDragOver(e));
                square.addEventListener('drop', (e) => this.handleDrop(e, row, col));

                this.boardElement.appendChild(square);
            }
        }

        this.updateUI();
    }

    getPieceUnicode(piece) {
        const pieces = {
            'P': '♙', 'p': '♟',
            'R': '♖', 'r': '♜',
            'N': '♘', 'n': '♞',
            'B': '♗', 'b': '♝',
            'Q': '♕', 'q': '♛',
            'K': '♔', 'k': '♚'
        };
        return pieces[piece] || '';
    }

    handleSquareClick(row, col) {
        if (this.game.isBoardLocked) return;

        if (this.game.gameMode === 'pva' && this.game.currentPlayer === 'black') return;

        const piece = this.game.getPiece(row, col);

        if (this.game.selectedSquare) {
            const [fromRow, fromCol] = this.game.selectedSquare;

            if (row === fromRow && col === fromCol) {
                this.game.selectedSquare = null;
                this.game.validMoves = [];
            } else {
                const validMove = this.game.validMoves.some(move => move[0] === row && move[1] === col);

                if (validMove) {
                    this.game.makeMove(fromRow, fromCol, row, col);
                    this.game.selectedSquare = null;
                    this.game.validMoves = [];

                    this.renderBoard();

                    // AI move
                    if (this.game.gameMode === 'pva' && this.game.currentPlayer === 'black') {
                        this.game.isBoardLocked = true;
                        setTimeout(() => {
                            this.game.makeAIMove();
                            this.game.isBoardLocked = false;
                            this.renderBoard();
                        }, 1000);
                    }
                } else if (piece && this.game.isPlayerPiece(piece, this.game.currentPlayer)) {
                    this.game.selectedSquare = [row, col];
                    this.game.validMoves = this.game.getValidMoves(row, col);
                } else {
                    this.game.selectedSquare = null;
                    this.game.validMoves = [];
                }
            }
        } else if (piece && this.game.isPlayerPiece(piece, this.game.currentPlayer)) {
            this.game.selectedSquare = [row, col];
            this.game.validMoves = this.game.getValidMoves(row, col);
        }

        this.renderBoard();
    }

    handleDragStart(e, row, col) {
        const piece = this.game.getPiece(row, col);
        if (!piece || !this.game.isPlayerPiece(piece, this.game.currentPlayer)) {
            e.preventDefault();
            return;
        }

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('fromRow', row);
        e.dataTransfer.setData('fromCol', col);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e, toRow, toCol) {
        e.preventDefault();
        const fromRow = parseInt(e.dataTransfer.getData('fromRow'));
        const fromCol = parseInt(e.dataTransfer.getData('fromCol'));

        const validMove = this.game.getValidMoves(fromRow, fromCol).some(
            move => move[0] === toRow && move[1] === toCol
        );

        if (validMove) {
            this.game.makeMove(fromRow, fromCol, toRow, toCol);
            this.game.selectedSquare = null;
            this.game.validMoves = [];

            this.renderBoard();

            if (this.game.gameMode === 'pva' && this.game.currentPlayer === 'black') {
                this.game.isBoardLocked = true;
                setTimeout(() => {
                    this.game.makeAIMove();
                    this.game.isBoardLocked = false;
                    this.renderBoard();
                }, 1000);
            }
        }
    }

    updateUI() {
        document.getElementById('whiteCaptured').textContent = `Captured: ${this.game.getCapturedCount('white')}`;
        document.getElementById('blackCaptured').textContent = `Captured: ${this.game.getCapturedCount('black')}`;
        document.getElementById('whiteTurn').textContent = this.game.currentPlayer === 'white' ? 'Your Turn' : 'Waiting...';
        document.getElementById('blackTurn').textContent = this.game.currentPlayer === 'black' ? 'Your Turn' : 'Waiting...';
        document.getElementById('moveHistory').textContent = `Move: ${this.game.moveHistory.length + 1}`;

        this.updateMoveHistory();

        // Check status
        if (this.game.isInCheck(this.game.currentPlayer)) {
            document.getElementById('gameStatus').textContent = '⚠️ Check!';
            this.boardElement.classList.add('check-animation');
            setTimeout(() => this.boardElement.classList.remove('check-animation'), 500);
        } else if (!this.game.hasValidMoves(this.game.currentPlayer)) {
            if (this.game.isInCheck(this.game.currentPlayer)) {
                document.getElementById('gameStatus').textContent = '🏁 Checkmate!';
                this.game.gameStatus = 'checkmate';
            } else {
                document.getElementById('gameStatus').textContent = '🤝 Stalemate!';
                this.game.gameStatus = 'stalemate';
            }
        } else {
            document.getElementById('gameStatus').textContent = `${this.game.currentPlayer.toUpperCase()} to move`;
        }
    }

    updateMoveHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        this.game.moveHistory.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'history-move';
            const fromPos = String.fromCharCode(97 + move.from[1]) + (8 - move.from[0]);
            const toPos = String.fromCharCode(97 + move.to[1]) + (8 - move.to[0]);
            moveElement.textContent = `${move.piece.toUpperCase()} ${fromPos}-${toPos}`;
            historyList.appendChild(moveElement);
        });
    }

    resetGame() {
        this.game.reset();
        this.renderBoard();
    }

    toggleSound() {
        this.game.soundEnabled = !this.game.soundEnabled;
        document.getElementById('soundToggle').classList.toggle('muted');
    }

    undoMove() {
        if (this.game.moveHistory.length > 0) {
            this.game.undoMove();
            if (this.game.gameMode === 'pva' && this.game.moveHistory.length > 0) {
                this.game.undoMove();
            }
            this.renderBoard();
        }
    }
}

// ==================== ADVANCED SOUND GENERATION ====================
function generateChessSounds() {
    // Move sound - pluck
    const moveSound = document.getElementById('moveSound');
    if (moveSound && moveSound.src.includes('base64')) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame();
    const ui = new UIManager(game);
    
    // Make game and ui globally accessible for debugging
    window.game = game;
    window.ui = ui;
    
    // Generate sounds
    generateChessSounds();
});
