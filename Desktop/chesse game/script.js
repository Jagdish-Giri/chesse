// ==================== CHESS GAME ENGINE ====================

class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
        this.enPassantSquare = null;
        this.initializeBoard();
    }

    initializeBoard() {
        // Create empty board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Black pieces
        this.board[0][0] = { type: 'rook', player: 'black' };
        this.board[0][1] = { type: 'knight', player: 'black' };
        this.board[0][2] = { type: 'bishop', player: 'black' };
        this.board[0][3] = { type: 'queen', player: 'black' };
        this.board[0][4] = { type: 'king', player: 'black' };
        this.board[0][5] = { type: 'bishop', player: 'black' };
        this.board[0][6] = { type: 'knight', player: 'black' };
        this.board[0][7] = { type: 'rook', player: 'black' };
        for (let i = 0; i < 8; i++) this.board[1][i] = { type: 'pawn', player: 'black' };

        // White pieces
        for (let i = 0; i < 8; i++) this.board[6][i] = { type: 'pawn', player: 'white' };
        this.board[7][0] = { type: 'rook', player: 'white' };
        this.board[7][1] = { type: 'knight', player: 'white' };
        this.board[7][2] = { type: 'bishop', player: 'white' };
        this.board[7][3] = { type: 'queen', player: 'white' };
        this.board[7][4] = { type: 'king', player: 'white' };
        this.board[7][5] = { type: 'bishop', player: 'white' };
        this.board[7][6] = { type: 'knight', player: 'white' };
        this.board[7][7] = { type: 'rook', player: 'white' };
    }

    isInCheck(player) {
        const kingPos = this.kingPositions[player];
        const enemy = player === 'white' ? 'black' : 'white';
        return this.isSquareAttackedBy(kingPos.row, kingPos.col, enemy);
    }

    isSquareAttackedBy(row, col, attacker) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.player === attacker) {
                    const moves = this.getPieceMoves(r, c, true);
                    if (moves.some(m => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPieceMoves(row, col, ignoreCheck = false) {
        const piece = this.board[row][col];
        if (!piece) return [];

        let moves = [];
        switch (piece.type) {
            case 'pawn': moves = this.getPawnMoves(row, col); break;
            case 'knight': moves = this.getKnightMoves(row, col); break;
            case 'bishop': moves = this.getBishopMoves(row, col); break;
            case 'rook': moves = this.getRookMoves(row, col); break;
            case 'queen': moves = this.getQueenMoves(row, col); break;
            case 'king': moves = this.getKingMoves(row, col); break;
        }

        if (!ignoreCheck) {
            moves = moves.filter(move => {
                const originalPiece = this.board[move.row][move.col];
                this.board[move.row][move.col] = piece;
                this.board[row][col] = null;
                if (piece.type === 'king') {
                    this.kingPositions[piece.player] = { row: move.row, col: move.col };
                }
                const inCheck = this.isInCheck(piece.player);
                this.board[row][col] = piece;
                this.board[move.row][move.col] = originalPiece;
                if (piece.type === 'king') {
                    this.kingPositions[piece.player] = { row, col };
                }
                return !inCheck;
            });
        }

        return moves;
    }

    getPawnMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        const direction = piece.player === 'white' ? -1 : 1;
        const startRow = piece.player === 'white' ? 6 : 1;

        // Forward move
        const nextRow = row + direction;
        if (nextRow >= 0 && nextRow <= 7 && !this.board[nextRow][col]) {
            moves.push({ row: nextRow, col });
            // Double move from start
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures
        for (let newCol of [col - 1, col + 1]) {
            if (newCol >= 0 && newCol <= 7) {
                const target = this.board[nextRow][newCol];
                if (target && target.player !== piece.player) {
                    moves.push({ row: nextRow, col: newCol });
                } else if (this.enPassantSquare && nextRow === this.enPassantSquare.row && newCol === this.enPassantSquare.col) {
                    moves.push({ row: nextRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const deltas = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        
        for (let [dRow, dCol] of deltas) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                const target = this.board[newRow][newCol];
                if (!target || target.player !== this.board[row][col].player) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        return moves;
    }

    getBishopMoves(row, col) {
        return this.getDiagonalMoves(row, col);
    }

    getRookMoves(row, col) {
        return this.getStraightMoves(row, col);
    }

    getQueenMoves(row, col) {
        return [...this.getStraightMoves(row, col), ...this.getDiagonalMoves(row, col)];
    }

    getStraightMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (let [dRow, dCol] of directions) {
            for (let i = 1; i <= 7; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;
                if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.player !== piece.player) moves.push({ row: newRow, col: newCol });
                    break;
                }
            }
        }
        return moves;
    }

    getDiagonalMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (let [dRow, dCol] of directions) {
            for (let i = 1; i <= 7; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;
                if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.player !== piece.player) moves.push({ row: newRow, col: newCol });
                    break;
                }
            }
        }
        return moves;
    }

    getKingMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        
        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                if (dRow === 0 && dCol === 0) continue;
                const newRow = row + dRow;
                const newCol = col + dCol;
                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    const target = this.board[newRow][newCol];
                    if (!target || target.player !== piece.player) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }

        // Castling
        if (!this.isInCheck(piece.player)) {
            const castlingRight = piece.player === 'white' ? this.castlingRights.white : this.castlingRights.black;
            const backRow = piece.player === 'white' ? 7 : 0;
            
            if (castlingRight.kingside && !this.board[backRow][5] && !this.board[backRow][6]) {
                if (this.board[backRow][7] && this.board[backRow][7].type === 'rook') {
                    moves.push({ row: backRow, col: 6, castling: 'kingside' });
                }
            }
            
            if (castlingRight.queenside && !this.board[backRow][1] && !this.board[backRow][2] && !this.board[backRow][3]) {
                if (this.board[backRow][0] && this.board[backRow][0].type === 'rook') {
                    moves.push({ row: backRow, col: 2, castling: 'queenside' });
                }
            }
        }

        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const target = this.board[toRow][toCol];
        const moveNotation = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}-${String.fromCharCode(97 + toCol)}${8 - toRow}`;

        // Capture
        if (target) {
            this.capturedPieces[piece.player].push(target);
        }

        // En passant
        if (piece.type === 'pawn' && fromCol !== toCol && !target) {
            const capturedRow = fromRow;
            const capturedPawn = this.board[capturedRow][toCol];
            this.capturedPieces[piece.player].push(capturedPawn);
            this.board[capturedRow][toCol] = null;
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Update king position
        if (piece.type === 'king') {
            this.kingPositions[piece.player] = { row: toRow, col: toCol };
        }

        // Castling
        if (piece.type === 'king' && Math.abs(fromCol - toCol) === 2) {
            const isKingside = toCol > fromCol;
            const rookCol = isKingside ? 7 : 0;
            const newRookCol = isKingside ? 5 : 3;
            const rook = this.board[fromRow][rookCol];
            this.board[fromRow][newRookCol] = rook;
            this.board[fromRow][rookCol] = null;
        }

        // Update castling rights
        if (piece.type === 'king') {
            if (piece.player === 'white') this.castlingRights.white = { kingside: false, queenside: false };
            else this.castlingRights.black = { kingside: false, queenside: false };
        }
        if (piece.type === 'rook') {
            const castleObj = piece.player === 'white' ? this.castlingRights.white : this.castlingRights.black;
            if (fromCol === 7) castleObj.kingside = false;
            if (fromCol === 0) castleObj.queenside = false;
        }

        // Pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', player: piece.player };
            piece.type = 'queen';
        }

        // En passant square
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantSquare = { row: (fromRow + toRow) / 2, col: toCol };
        } else {
            this.enPassantSquare = null;
        }

        // Record move
        this.moveHistory.push(moveNotation);
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        return true;
    }

    hasValidMoves(player) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.player === player) {
                    if (this.getPieceMoves(r, c).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isCheckmate(player) {
        return this.isInCheck(player) && !this.hasValidMoves(player);
    }

    isStalemate(player) {
        return !this.isInCheck(player) && !this.hasValidMoves(player);
    }

    reset() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
        this.enPassantSquare = null;
        this.initializeBoard();
    }
}

// ==================== UI MANAGER ====================

class UIManager {
    constructor(game) {
        this.game = game;
        this.soundEnabled = true;
        this.setupEventListeners();
        this.showLoader();
    }

    showLoader() {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            loader.style.animation = 'fadeOut 0.5s ease-in-out forwards';
        }, 2500);
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
    }

    renderBoard() {
        const board = document.getElementById('chessboard');
        board.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                // Highlight valid moves
                if (this.game.validMoves.some(m => m.row === row && m.col === col)) {
                    square.classList.add('valid-move');
                }

                // Highlight selected square
                if (this.game.selectedSquare && this.game.selectedSquare.row === row && this.game.selectedSquare.col === col) {
                    square.classList.add('valid-move');
                }

                // Highlight check
                const piece = this.game.board[row][col];
                if (piece && piece.type === 'king' && piece.player === this.game.currentPlayer && this.game.isInCheck(piece.player)) {
                    square.classList.add('check');
                }

                // Add piece
                if (piece) {
                    const pieceEl = document.createElement('span');
                    pieceEl.className = 'piece-element';
                    pieceEl.textContent = this.getPieceSymbol(piece);
                    square.appendChild(pieceEl);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                board.appendChild(square);
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            'white_pawn': '♙', 'white_knight': '♘', 'white_bishop': '♗',
            'white_rook': '♖', 'white_queen': '♕', 'white_king': '♔',
            'black_pawn': '♟', 'black_knight': '♞', 'black_bishop': '♝',
            'black_rook': '♜', 'black_queen': '♛', 'black_king': '♚'
        };
        return symbols[`${piece.player}_${piece.type}`] || '';
    }

    handleSquareClick(row, col) {
        const piece = this.game.board[row][col];

        // Case 1: Select a piece
        if (piece && piece.player === this.game.currentPlayer && !this.game.selectedSquare) {
            this.game.selectedSquare = { row, col };
            this.game.validMoves = this.game.getPieceMoves(row, col);
            this.renderBoard();
            return;
        }

        // Case 2: Click same piece again = deselect
        if (this.game.selectedSquare && row === this.game.selectedSquare.row && col === this.game.selectedSquare.col) {
            this.game.selectedSquare = null;
            this.game.validMoves = [];
            this.renderBoard();
            return;
        }

        // Case 3: Click valid move
        if (this.game.selectedSquare && this.game.validMoves.some(m => m.row === row && m.col === col)) {
            this.game.makeMove(this.game.selectedSquare.row, this.game.selectedSquare.col, row, col);
            this.playMoveSound();
            this.game.selectedSquare = null;
            this.game.validMoves = [];

            // Check game status
            if (this.game.isCheckmate(this.game.currentPlayer)) {
                this.showResult(`${this.game.currentPlayer === 'white' ? 'Black' : 'White'} Wins!`, '🏆');
            } else if (this.game.isStalemate(this.game.currentPlayer)) {
                this.showResult('Draw - Stalemate', '🤝');
            } else if (this.game.isInCheck(this.game.currentPlayer)) {
                this.playCheckSound();
            }

            this.renderBoard();
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('turnDisplay').textContent = `${this.game.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`;
        
        // Update captured pieces
        const whiteCapturedDiv = document.getElementById('whiteCaptured');
        const blackCapturedDiv = document.getElementById('blackCaptured');
        whiteCapturedDiv.innerHTML = this.game.capturedPieces.black.map(p => this.getPieceSymbol(p)).join('');
        blackCapturedDiv.innerHTML = this.game.capturedPieces.white.map(p => this.getPieceSymbol(p)).join('');

        // Update move history
        const historyDiv = document.getElementById('moveHistory');
        historyDiv.innerHTML = this.game.moveHistory.map(move => `<span class="move-item">${move}</span>`).join('');
    }

    resetGame() {
        this.game.reset();
        document.getElementById('resultModal').classList.remove('show');
        this.renderBoard();
        this.updateUI();
    }

    showResult(message, emoji) {
        document.getElementById('resultTitle').textContent = 'Game Over!';
        document.getElementById('resultMessage').textContent = message;
        document.querySelector('.result-emoji').textContent = emoji;
        document.getElementById('resultModal').classList.add('show');
    }

    playMoveSound() {
        if (!this.soundEnabled) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // Wooden knock sound
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playCheckSound() {
        if (!this.soundEnabled) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.setValueAtTime(650, now + 0.1);
        osc.frequency.setValueAtTime(500, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.classList.toggle('muted');
        btn.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
}

// ==================== GAME INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame();
    const ui = new UIManager(game);
    ui.renderBoard();
    ui.updateUI();
});
