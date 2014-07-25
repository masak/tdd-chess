'use strict';

var Color = {
    WHITE: "white",
    BLACK: "black"
};

var Type = {
    ROOK: {
        name: "rook",
        jumpIsLegal: function(move) {
            return move.isHorizontal() || move.isVertical();
        }
    },
    KNIGHT: {
        name: "knight",
        jumpIsLegal: function(move) {
            return move.isKnightMove();
        }
    },
    BISHOP: {
        name: "bishop",
        jumpIsLegal: function(move) {
            return move.isDiagonal();
        }
    },
    QUEEN: {
        name: "queen",
        jumpIsLegal: function(move) {
            return Type.ROOK.jumpIsLegal(move) || Type.BISHOP.jumpIsLegal(move);
        }
    },
    KING: {
        name: "king",
        jumpIsLegal: function(move) {
            return move.isOneStep();
        }
    },
    PAWN: {
        name: "pawn",
        jumpIsLegal: function(move, color) {
            return move.isForwards(color) && move.isOneStep();
        }
    }
};

var Piece = function(color, type) {
    this.color = color;
    this.type = type;

    this.name = color + " " + type.name;
};

Piece.prototype.jumpIsLegal = function(move) {
    return this.type.jumpIsLegal(move, this.color);
};

Piece.prototype.symbol = function(color, type) {
    var i = ['white', 'black'].indexOf(this.color);
    var j = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].indexOf(this.type.name);
    return '&#' + (9812 + 6 * i + j) + ';';
};

Piece.WHITE_ROOK = new Piece(Color.WHITE, Type.ROOK);
Piece.WHITE_KNIGHT = new Piece(Color.WHITE, Type.KNIGHT);
Piece.WHITE_BISHOP = new Piece(Color.WHITE, Type.BISHOP);
Piece.WHITE_QUEEN = new Piece(Color.WHITE, Type.QUEEN);
Piece.WHITE_KING = new Piece(Color.WHITE, Type.KING);
Piece.WHITE_PAWN = new Piece(Color.WHITE, Type.PAWN);

Piece.BLACK_ROOK = new Piece(Color.BLACK, Type.ROOK);
Piece.BLACK_KNIGHT = new Piece(Color.BLACK, Type.KNIGHT);
Piece.BLACK_BISHOP = new Piece(Color.BLACK, Type.BISHOP);
Piece.BLACK_QUEEN = new Piece(Color.BLACK, Type.QUEEN);
Piece.BLACK_KING = new Piece(Color.BLACK, Type.KING);
Piece.BLACK_PAWN = new Piece(Color.BLACK, Type.PAWN);

var EMPTY = {
    jumpIsLegal: function() { return false },
    symbol: function() { return "" }
};

var Move = function(gameState, fromPos, toPos) {
    this.fromPos = fromPos;
    this.toPos = toPos;
    this.piece = gameState.board[ fromPos[0] ][ fromPos[1] ];
    this.playerOnTurn = gameState.playerOnTurn;
    this.make = function() {
        gameState.makeMove(this);
    };
};

Move.prototype = {
    isLegal: function() {
        if (this.piece.color !== this.playerOnTurn) {
            return false;
        }
        return this.piece.jumpIsLegal(this);
    },

    rankDist: function() {
        return Math.abs(this.fromPos[0] - this.toPos[0]);
    },

    fileDist: function() {
        return Math.abs(this.fromPos[1] - this.toPos[1]);
    },

    isHorizontal: function() {
        return this.rankDist() === 0;
    },

    isVertical: function() {
        return this.fileDist() === 0;
    },

    isKnightMove: function() {
        return this.rankDist() === 1 && this.fileDist() === 2 ||
               this.rankDist() === 2 && this.fileDist() === 1;
    },

    isDiagonal: function() {
        return this.rankDist() === this.fileDist();
    },

    isOneStep: function() {
        return this.rankDist() <= 1 && this.fileDist() <= 1;
    },

    isForwards: function(color) {
        return color === "white" && this.toPos[0] > this.fromPos[0] ||
               color === "black" && this.toPos[0] < this.fromPos[0];
    }
};

var gameState = {
    playerOnTurn: Color.WHITE,

    board: (function () {
        var board = [];
        for (var i = 0; i < 8; i++) {
            var row = [];
            for (var j = 0; j < 8; j++) {
                row.push(EMPTY);
            }
            board.push(row);
        }

        board.empty = function() {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    this[i][j] = EMPTY;
                }
            }
        };

        board.chess = function() {
            this.empty();

            var pieces = [
                [Piece.WHITE_ROOK, Piece.WHITE_KNIGHT, Piece.WHITE_BISHOP, Piece.WHITE_QUEEN,
                    Piece.WHITE_KING, Piece.WHITE_BISHOP, Piece.WHITE_KNIGHT, Piece.WHITE_ROOK],
                [Piece.WHITE_PAWN, Piece.WHITE_PAWN, Piece.WHITE_PAWN, Piece.WHITE_PAWN,
                    Piece.WHITE_PAWN, Piece.WHITE_PAWN, Piece.WHITE_PAWN, Piece.WHITE_PAWN],
                [Piece.BLACK_PAWN, Piece.BLACK_PAWN, Piece.BLACK_PAWN, Piece.BLACK_PAWN,
                    Piece.BLACK_PAWN, Piece.BLACK_PAWN, Piece.BLACK_PAWN, Piece.BLACK_PAWN],
                [Piece.BLACK_ROOK, Piece.BLACK_KNIGHT, Piece.BLACK_BISHOP, Piece.BLACK_QUEEN,
                    Piece.BLACK_KING, Piece.BLACK_BISHOP, Piece.BLACK_KNIGHT, Piece.BLACK_ROOK]
            ];

            var rows = [0, 1, 6, 7];
            for (var i in rows) {
                var r = rows[i];
                this[r] = pieces[i];
            }
        };

        board.makeMove = function(move) {
            this[move.toPos[0]][move.toPos[1]] = this[move.fromPos[0]][move.fromPos[1]];
            this[move.fromPos[0]][move.fromPos[1]] = EMPTY;
        };

        board.clone = function() {
            var newBoard = [];
            for (var i = 0; i < 8; i++) {
                var row = [];
                for (var j = 0; j < 8; j++) {
                    row.push(this[i][j]);
                }
                newBoard.push(row);
            }

            for (var prop in this) {
                if (prop.match(/^\d+$/)) {
                    continue;
                }
                if (this.hasOwnProperty(prop)) {
                    newBoard[prop] = this[prop];
                }
            }

            return newBoard;
        };

        return board;
    })(),

    reset: function() {
        this.playerOnTurn = Color.WHITE;
        this.board.empty();
    },

    chess: function() {
        this.playerOnTurn = Color.WHITE;
        this.board.chess();
    },

    makeMove: function(move) {
        this.board.makeMove(move);
        this.playerOnTurn = this.playerOnTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
    },

    clone: function() {
        var newState = {};

        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                newState[prop] = this[prop];
            }
        }
        newState.board = this.board.clone();

        return newState;
    }
};
