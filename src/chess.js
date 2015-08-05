'use strict';

var Color = {
    WHITE: "white",
    BLACK: "black"
};

var lineOfSight = function lineOfSight(move) {
    var positions = [];
    var dr = Math.sign(move.toPos[0] - move.fromPos[0]);
    var df = Math.sign(move.toPos[1] - move.fromPos[1]);
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
            return Type.ROOK.jumpIsLegal(move) ||
                Type.BISHOP.jumpIsLegal(move);
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
            return move.isForwards(color) &&
                move.isOneOrTwoSteps() &&
                move.fileDist() < 2;
        },
        positionsBetween: lineOfSight
    }
};

var pieceName = function pieceName(color, type) {
    return color + " " + type.name;
}

var Piece = function Piece(color, type) {
    return {
        color: color,
        type: type,
        name: pieceName(color, type),
        jumpIsLegal: function jumpIsLegal(move) {
            return this.type.jumpIsLegal(move, this.color);
        },
        positionsBetween: function positionsBetween(move) {
            return this.type.positionsBetween(move);
        },
        symbol: function symbol(type) {
            var names = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
            var i = names.indexOf(this.type.name);
            return '&#' + (9818 + i) + ';';
        }
    };
}

Piece.WHITE_ROOK = Piece(Color.WHITE, Type.ROOK);
Piece.WHITE_KNIGHT = Piece(Color.WHITE, Type.KNIGHT);
Piece.WHITE_BISHOP = Piece(Color.WHITE, Type.BISHOP);
Piece.WHITE_QUEEN = Piece(Color.WHITE, Type.QUEEN);
Piece.WHITE_KING = Piece(Color.WHITE, Type.KING);
Piece.WHITE_PAWN = Piece(Color.WHITE, Type.PAWN);

Piece.BLACK_ROOK = Piece(Color.BLACK, Type.ROOK);
Piece.BLACK_KNIGHT = Piece(Color.BLACK, Type.KNIGHT);
Piece.BLACK_BISHOP = Piece(Color.BLACK, Type.BISHOP);
Piece.BLACK_QUEEN = Piece(Color.BLACK, Type.QUEEN);
Piece.BLACK_KING = Piece(Color.BLACK, Type.KING);
Piece.BLACK_PAWN = Piece(Color.BLACK, Type.PAWN);

var EMPTY = {
    color: undefined,
    type: { name: "empty square" },
    jumpIsLegal: function jumpIsLegal() { return false },
    positionsBetween: function positionsBetween() { return [] },
    symbol: function symbol() { return "" }
};

var Move = function Move(gameState, fromPos, toPos) {
    var playerOnTurn = gameState.playerOnTurn;
    var playersKing = pieceName(playerOnTurn, Type.KING);
    var pos2sq = function pos2sq(pos) {
        return gameState.board[ pos[0] ][ pos[1] ];
    };
    var givenThat = function givenThat(premise) {
        return {
            then: function then(consequence) {
                return !premise || consequence;
            }
        };
    };
    var piece = gameState.board[ fromPos[0] ][ fromPos[1] ];

    var move = {
        fromPos: fromPos,
        toPos: toPos,
        piece: piece,
        targetSquare: gameState.board[ toPos[0] ][ toPos[1] ],
        playerOnTurn: playerOnTurn,
        kingAlreadyMoved: gameState.piecesMoved[playersKing],
        rookIsThere: function rookIsThere() {
            var rank = fromPos[0];
            var file = toPos[1] > fromPos[1] ? 7 : 0;
            var square = gameState.board[rank][file];
            return square.type === Type.ROOK && square.color === this.piece.color;
        },
        rookAlreadyMoved: function rookAlreadyMoved() {
            var kingsOrQueens = toPos[1] > fromPos[1] ? "king's" : "queen's";
            var playersRook = pieceName(this.playerOnTurn, Type.ROOK);
            return gameState.piecesMoved[kingsOrQueens + " " + playersRook];
        },
        noPiecesInTheWayForRook: function noPiecesInTheWayForRook() {
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

            var rookMove = Move(gameState, rookFromPos(), rookToPos());
            return rookMove.squaresBetweenAreEmpty();
        },
        isEnPassant: function isEnPassant() {
            return gameState.enPassant.isPossible &&
                gameState.enPassant.capturePos[0] === toPos[0] &&
                gameState.enPassant.capturePos[1] === toPos[1];
        },
        make: function make() {
            gameState.makeMove(this);
        },
        isLegal: function isLegal() {
            var pieceBelongsToPlayer = function pieceBelongsToPlayer() {
                return this.piece.color === this.playerOnTurn;
            }.bind(this);
            var notTakingFriendly = function notTakingFriendly() {
                return this.targetSquare.color !== this.piece.color;
            }.bind(this);
            var oneRankOneFile = function moveIsInSameFile() {
                return this.fileDist() === 1 && this.rankDist() === 1;
            }.bind(this);
            var takingMove = function takingMove() {
                return this.targetSquare !== EMPTY || this.isEnPassant();
            }.bind(this);
            var pieceIsPawn = function pieceIsPawn() {
                return this.piece.type === Type.PAWN;
            }.bind(this);
            var pawnRestrictionHolds = function pawnRestrictionHolds() {
                return (oneRankOneFile() === takingMove()) &&
                        (this.rankDist() === 1 || this.fromPos[0] === 1 ||
                         this.fromPos[0] === 6);
            }.bind(this);
            var pieceIsKing = function pieceIsKing() {
                return this.piece.type === Type.KING;
            }.bind(this);
            var kingRestrictionHolds = function kingRestrictionHolds() {
                return this.isOneStep() || this.isCastling();
            }.bind(this);

            return pieceBelongsToPlayer()         &&
                notTakingFriendly()               &&
                givenThat(pieceIsPawn())
                    .then(pawnRestrictionHolds()) &&
                givenThat(pieceIsKing())
                    .then(kingRestrictionHolds()) &&
                this.piece.jumpIsLegal(this)      &&
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
            return this.piece.type === Type.KING &&
                   this.rookIsThere() &&
                   !this.kingAlreadyMoved &&
                   !this.rookAlreadyMoved() &&
                   this.noPiecesInTheWayForRook() &&
                (this.fromPos[0] === 0 || this.fromPos[0] === 7);
        },
        isPawnDoubleAdvance: function isPawnDoubleAdvance() {
            return this.piece.type === Type.PAWN &&
                   this.rankDist() === 2;
        },
        squaresBetweenAreEmpty: function squaresBetweenAreEmpty() {
            var isEmpty = function isEmpty(sq) { return sq === EMPTY };
            return this.squaresBetween.every(isEmpty);
        }
    };
    move.squaresBetween = piece.positionsBetween(move).map(pos2sq);
    return move;
}

var gameState = {
    playerOnTurn: Color.WHITE,

    piecesMoved: {
    },

    enPassant: {
        isPossible: false,
        capturePos: undefined
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

        board.clear = function clear() {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    this[i][j] = EMPTY;
                }
            }
        };

        board.chess = function chess() {
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
                wp = Piece.WHITE_PAWN,
                __ = EMPTY;

            var chessLayout = [
                [br, bn, bb, bq, bk, bb, bn, br],
                [bp, bp, bp, bp, bp, bp, bp, bp],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [wp, wp, wp, wp, wp, wp, wp, wp],
                [wr, wn, wb, wq, wk, wb, wn, wr]
            ];

            for (var row in chessLayout) {
                this[row] = chessLayout[row];
            }
        };

        board.makeMove = function makeMove(move) {
            var fromRank = move.fromPos[0],
                fromFile = move.fromPos[1],
                toRank   = move.toPos[0],
                toFile   = move.toPos[1];
            this[toRank][toFile] = this[fromRank][fromFile];
            this[fromRank][fromFile] = EMPTY;
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
        this.board.clear();
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
        var oppositePlayer = function oppositePlayer(color) {
            return color === Color.WHITE ? Color.BLACK : Color.WHITE;
        };

        markPieceMoved(move.fromPos);
        if (move.isCastling()) {
            this.board.makeMove(Move(gameState, rookFromPos(), rookToPos()));
        }
        if (move.isEnPassant()) {
            var pawnRank = this.enPassant.pawnPos[0],
                pawnFile = this.enPassant.pawnPos[1];
            this.board[pawnRank][pawnFile] = EMPTY;
        }
        if (move.isPawnDoubleAdvance()) {
            this.enPassant.isPossible = true;
            this.enPassant.pawnPos = move.toPos;
            var delta = move.piece.color === Color.WHITE ? +1 : -1;
            this.enPassant.capturePos = [move.toPos[0] + delta, move.toPos[1]];
        }
        else {
            this.enPassant.isPossible = false;
        }
        this.board.makeMove(move);
        this.playerOnTurn = oppositePlayer(this.playerOnTurn);
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
        newState.enPassant = {};
        for (var prop in this.enPassant) {
            if (this.enPassant.hasOwnProperty(prop)) {
                newState.enPassant[prop] = this.enPassant[prop];
            }
        }

        return newState;
    }
};
