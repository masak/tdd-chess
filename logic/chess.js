'use strict';

var Color = {
    WHITE: "white",
    BLACK: "black"
};

var lineOfSight = function(move) {
    var positions = [];
    var sgn = function(value) {
        return value > 0 ? +1 : value < 0 ? -1 : 0;
    };
    var dr = sgn(move.toPos[0] - move.fromPos[0]);
    var df = sgn(move.toPos[1] - move.fromPos[1]);
    var reached = function(value, limit, delta) {
        return delta > 0 ? value >= limit :
               delta < 0 ? value <= limit :
               false;
    };

    var rank = move.fromPos[0] + dr;
    var file = move.fromPos[1] + df;
    while (!reached(rank, move.toPos[0], dr) &&
           !reached(file, move.toPos[1], df)) {
        positions.push([rank, file]);
        rank += dr;
        file += df;
    }
    return positions;
};

var noPositions = function(move) {
    return [];
};

var Type = {
    ROOK: {
        name: "rook",
        jumpIsLegal: function(move) {
            return move.isHorizontal() || move.isVertical();
        },
        positionsBetween: lineOfSight
    },
    KNIGHT: {
        name: "knight",
        jumpIsLegal: function(move) {
            return move.isKnightMove();
        },
        positionsBetween: noPositions
    },
    BISHOP: {
        name: "bishop",
        jumpIsLegal: function(move) {
            return move.isDiagonal();
        },
        positionsBetween: lineOfSight
    },
    QUEEN: {
        name: "queen",
        jumpIsLegal: function(move) {
            return Type.ROOK.jumpIsLegal(move) || Type.BISHOP.jumpIsLegal(move);
        },
        positionsBetween: lineOfSight
    },
    KING: {
        name: "king",
        jumpIsLegal: function(move) {
            return move.isOneStep();
        },
        positionsBetween: noPositions
    },
    PAWN: {
        name: "pawn",
        jumpIsLegal: function(move, color) {
            return move.isForwards(color) && move.isOneStep();
        },
        positionsBetween: lineOfSight
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

Piece.prototype.positionsBetween = function(move) {
    return this.type.positionsBetween(move);
};

Piece.prototype.symbol = function(type) {
    var i = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].indexOf(this.type.name);
    return '&#' + (9818 + i) + ';';
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
    color: undefined,
    type: { name: "empty square" },
    jumpIsLegal: function() { return false },
    positionsBetween: function() { return [] },
    symbol: function() { return "" }
};

var Move = function(gameState, fromPos, toPos) {
    this.fromPos = fromPos;
    this.toPos = toPos;
    this.piece = gameState.board[ fromPos[0] ][ fromPos[1] ];
    this.targetSquare = gameState.board[ toPos[0] ][ toPos[1] ];
    this.playerOnTurn = gameState.playerOnTurn;
    this.squaresBetween = this.piece.positionsBetween(this).map(function(pos) {
        return gameState.board[ pos[0] ][ pos[1] ];
    });
    this.make = function() {
        gameState.makeMove(this);
    };
};

Move.prototype = {
    isLegal: function() {
        if (this.piece.color !== this.playerOnTurn) {
            return false;
        }
        if (this.targetSquare.color === this.piece.color) {
            return false;
        }
        if (this.piece.type === Type.PAWN) {
            if ((this.fileDist() === 0) !== (this.targetSquare === EMPTY)) {
                return false;
            }
        }
        if (!this.piece.jumpIsLegal(this)) {
            return false;
        }
        if (this.squaresBetween.some(function(sq) { return sq !== EMPTY })) {
            return false;
        }
        return true;
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
        return color === "white" && this.toPos[0] < this.fromPos[0] ||
               color === "black" && this.toPos[0] > this.fromPos[0];
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

            var br = Piece.BLACK_ROOK,
                bn = Piece.BLACK_KNIGHT,
                bb = Piece.BLACK_BISHOP,
                bq = Piece.BLACK_QUEEN,
                bk = Piece.BLACK_KING,
                bp = Piece.BLACK_PAWN,
                wr = Piece.WHITE_ROOK,
                wn = Piece.WHITE_KNIGHT,
                wb = Piece.WHITE_BISHOP,
                wq = Piece.WHITE_QUEEN,
                wk = Piece.WHITE_KING,
                wp = Piece.WHITE_PAWN;

            var pieces = {
                0: [br, bn, bb, bq, bk, bb, bn, br],
                1: [bp, bp, bp, bp, bp, bp, bp, bp],
                6: [wr, wp, wp, wp, wp, wp, wp, wp],
                7: [wr, wn, wb, wq, wk, wb, wn, wr]
            };

            for (var row in pieces) {
                this[row] = pieces[row];
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
