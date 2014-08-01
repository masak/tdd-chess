'use strict';

var Color = {
    WHITE: "white",
    BLACK: "black"
};

var lineOfSight = function lineOfSight(move) {
    var positions = [];
    var sgn = function sgn(value) {
        return value > 0 ? +1 : value < 0 ? -1 : 0;
    };
    var dr = sgn(move.toPos[0] - move.fromPos[0]);
    var df = sgn(move.toPos[1] - move.fromPos[1]);
    var reached = function reached(value, limit, delta) {
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

var noPositions = function noPositions(move) {
    return [];
};

var Type = {
    ROOK: {
        name: "rook",
        jumpIsLegal: function jumpIsLegal(move) {
            return move.isHorizontal() || move.isVertical();
        },
        positionsBetween: lineOfSight
    },
    KNIGHT: {
        name: "knight",
        jumpIsLegal: function jumpIsLegal(move) {
            return move.isKnightMove();
        },
        positionsBetween: noPositions
    },
    BISHOP: {
        name: "bishop",
        jumpIsLegal: function jumpIsLegal(move) {
            return move.isDiagonal();
        },
        positionsBetween: lineOfSight
    },
    QUEEN: {
        name: "queen",
        jumpIsLegal: function jumpIsLegal(move) {
            return Type.ROOK.jumpIsLegal(move) || Type.BISHOP.jumpIsLegal(move);
        },
        positionsBetween: lineOfSight
    },
    KING: {
        name: "king",
        jumpIsLegal: function jumpIsLegal(move) {
            return move.isOneOrTwoSteps();
        },
        positionsBetween: lineOfSight
    },
    PAWN: {
        name: "pawn",
        jumpIsLegal: function jumpIsLegal(move, color) {
            return move.isForwards(color) && move.isOneStep();
        },
        positionsBetween: lineOfSight
    }
};

var pieceName = function pieceName(color, type) {
    return color + " " + type.name;
}

var Piece = function Piece(color, type) {
    this.color = color;
    this.type = type;

    this.name = pieceName(color, type);
};

Piece.prototype.jumpIsLegal = function jumpIsLegal(move) {
    return this.type.jumpIsLegal(move, this.color);
};

Piece.prototype.positionsBetween = function positionsBetween(move) {
    return this.type.positionsBetween(move);
};

Piece.prototype.symbol = function symbol(type) {
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
    jumpIsLegal: function jumpIsLegal() { return false },
    positionsBetween: function positionsBetween() { return [] },
    symbol: function symbol() { return "" }
};

var Move = function Move(gameState, fromPos, toPos) {
    this.fromPos = fromPos;
    this.toPos = toPos;
    this.piece = gameState.board[ fromPos[0] ][ fromPos[1] ];
    this.targetSquare = gameState.board[ toPos[0] ][ toPos[1] ];
    this.playerOnTurn = gameState.playerOnTurn;
    this.kingAlreadyMoved = gameState.piecesMoved[pieceName(this.playerOnTurn, Type.KING)];
    this.squaresBetween = this.piece.positionsBetween(this).map(function squareFromPos(pos) {
        return gameState.board[ pos[0] ][ pos[1] ];
    });
    this.squaresBetweenAreEmpty = function squaresBetweenAreEmpty() {
        var isEmpty = function isEmpty(sq) { return sq === EMPTY };
        return this.squaresBetween.every(isEmpty);
    };
    this.rookIsThere = function rookIsThere() {
        var square = gameState.board[ fromPos[0] ][ toPos[1] > fromPos[1] ? 7 : 0 ];
        return square.type === Type.ROOK && square.color === this.piece.color;
    };
    this.rookAlreadyMoved = function rookAlreadyMoved() {
        var kingsOrQueens = toPos[1] > fromPos[1] ? "king's" : "queen's";
        return gameState.piecesMoved[kingsOrQueens + " " + pieceName(this.playerOnTurn, Type.ROOK)];
    };
    this.noPiecesInTheWayForRook = function noPiecesInTheWayForRook() {
        var rookFromPos = function rookFromPos() {
            var rank = this.fromPos[0];
            var file = this.toPos[1] > this.fromPos[1] ? 7 : 0;
            return [rank, file];
        }.bind(this);
        var rookToPos = function rookToPos() {
            var rank = this.fromPos[0];
            var file = this.toPos[1] > this.fromPos[1] ? 5 : 3;
            return [rank, file];
        }.bind(this);

        return new Move(gameState, rookFromPos(), rookToPos()).squaresBetweenAreEmpty();
    };
    this.make = function make() {
        gameState.makeMove(this);
    };
};

var givenThat = function givenThat(premise) {
    return {
        then: function then(consequence) {
            return !premise || consequence;
        }
    };
};

Move.prototype = {
    isLegal: function isLegal() {
        var pieceBelongsToPlayer = function pieceBelongsToPlayer() { return this.piece.color === this.playerOnTurn; }.bind(this);
        var targetSquareDoesNotHaveFriendlyPiece = function targetSquareDoesNotHaveFriendlyPiece() { return this.targetSquare.color !== this.piece.color; }.bind(this);
        var moveIsInSameFile = function moveIsInSameFile() { return this.fileDist() === 0; }.bind(this);
        var takingMove = function takingMove() { return this.targetSquare !== EMPTY; }.bind(this);
        var pieceIsPawn = function pieceIsPawn() { return this.piece.type === Type.PAWN; }.bind(this);
        var pawnRestrictionHolds = function pawnRestrictionHolds() { return moveIsInSameFile() !== takingMove(); }.bind(this);
        var pieceIsKing = function pieceIsKing() { return this.piece.type === Type.KING; }.bind(this);
        var kingRestrictionHolds = function kingRestrictionHolds() { return this.isOneStep() || this.isCastling(); }.bind(this);
        var pieceJumpIsLegal = function pieceJumpIsLegal() { return this.piece.jumpIsLegal(this); }.bind(this);

        return pieceBelongsToPlayer()                             &&
            targetSquareDoesNotHaveFriendlyPiece()                &&
            givenThat(pieceIsPawn()).then(pawnRestrictionHolds()) &&
            givenThat(pieceIsKing()).then(kingRestrictionHolds()) &&
            pieceJumpIsLegal()                                    &&
            this.squaresBetweenAreEmpty();
    },

    rankDist: function rankDist() {
        return Math.abs(this.fromPos[0] - this.toPos[0]);
    },

    fileDist: function fileDist() {
        return Math.abs(this.fromPos[1] - this.toPos[1]);
    },

    isHorizontal: function isHorizontal() {
        return this.rankDist() === 0;
    },

    isVertical: function isVertical() {
        return this.fileDist() === 0;
    },

    isKnightMove: function isKnightMove() {
        return this.rankDist() === 1 && this.fileDist() === 2 ||
               this.rankDist() === 2 && this.fileDist() === 1;
    },

    isDiagonal: function isDiagonal() {
        return this.rankDist() === this.fileDist();
    },

    isOneStep: function isOneStep() {
        return this.rankDist() <= 1 && this.fileDist() <= 1;
    },

    isOneOrTwoSteps: function isOneOrTwoSteps() {
        return this.rankDist() <= 2 && this.fileDist() <= 2;
    },

    isForwards: function isForwards(color) {
        return color === "white" && this.toPos[0] < this.fromPos[0] ||
               color === "black" && this.toPos[0] > this.fromPos[0];
    },

    isCastling: function isCastling() {
        return this.piece.type == Type.KING &&
               this.rookIsThere() &&
               !this.kingAlreadyMoved &&
               !this.rookAlreadyMoved() &&
               this.noPiecesInTheWayForRook() &&
            (this.fromPos[0] === 0 || this.fromPos[0] === 7);
    }
};

var gameState = {
    playerOnTurn: Color.WHITE,

    piecesMoved: {
    },

    board: (function createBoard() {
        var board = [];
        for (var i = 0; i < 8; i++) {
            var row = [];
            for (var j = 0; j < 8; j++) {
                row.push(EMPTY);
            }
            board.push(row);
        }

        board.empty = function empty() {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    this[i][j] = EMPTY;
                }
            }
        };

        board.chess = function chess() {
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
                6: [wp, wp, wp, wp, wp, wp, wp, wp],
                7: [wr, wn, wb, wq, wk, wb, wn, wr]
            };

            for (var row in pieces) {
                this[row] = pieces[row];
            }
        };

        board.makeMove = function makeMove(move) {
            this[move.toPos[0]][move.toPos[1]] = this[move.fromPos[0]][move.fromPos[1]];
            this[move.fromPos[0]][move.fromPos[1]] = EMPTY;
        };

        board.clone = function clone() {
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

    reset: function reset() {
        this.playerOnTurn = Color.WHITE;
        this.piecesMoved = {};
        this.board.empty();
    },

    chess: function chess() {
        this.playerOnTurn = Color.WHITE;
        this.piecesMoved = {};
        this.board.chess();
    },

    makeMove: function makeMove(move) {
        var markPieceMoved = function markPieceMoved(pos) {
            var rank = pos[0];
            var file = pos[1];
            var piece = this.board[rank][file];
            if (piece.type === Type.KING) {
                this.piecesMoved[piece.name] = true;
            }
            else if (piece.type === Type.ROOK) {
                if (rank != 0 && rank != 7) {
                    return;
                }
                var kingsOrQueens = file == 0 ? "queen's" :
                                    file == 7 ? "king's"  :
                                                undefined;
                if (!kingsOrQueens) {
                    return;
                }
                this.piecesMoved[kingsOrQueens + " " + piece.name] = true;
            }
        }.bind(this);
        var rookFromPos = function rookFromPos() {
            var rank = move.fromPos[0];
            var file = move.toPos[1] > move.fromPos[1] ? 7 : 0;
            return [rank, file];
        };
        var rookToPos = function rookToPos() {
            var rank = move.fromPos[0];
            var file = move.toPos[1] > move.fromPos[1] ? 5 : 3;
            return [rank, file];
        };

        markPieceMoved(move.fromPos);
        if (move.isCastling()) {
            this.board.makeMove(new Move(gameState, rookFromPos(), rookToPos()));
        }
        this.board.makeMove(move);
        this.playerOnTurn = this.playerOnTurn === Color.WHITE ? Color.BLACK : Color.WHITE;
    },

    clone: function clone() {
        var newState = {};

        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                newState[prop] = this[prop];
            }
        }
        newState.board = this.board.clone();
        newState.piecesMoved = {};
        for (var prop in this.piecesMoved) {
            if (this.piecesMoved.hasOwnProperty(prop)) {
                newState.piecesMoved[prop] = this.piecesMoved[prop];
            }
        }

        return newState;
    }
};
