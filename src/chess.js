'use strict';

var pieceRules = {
    defaults: {
        moveIsLegal: function moveIsNeverLegalByDefault(move) {
            return false;
        },
        intermediatePositions: function lineOfSightByDefault(move) {
            return move.lineOfSight();
        }
    },
    rook: {
        moveIsLegal: function rookMoveIsLegal(move) {
            return move.staysInRank() || move.staysInFile();
        }
    },
    knight: {
        moveIsLegal: function knightMoveIsLegal(move) {
            var rd = move.rankDistance();
            var fd = move.fileDistance();
            return (rd == 1 && fd == 2) || (rd == 2 && fd == 1);
        },
        intermediatePositions: function knightHasNoIntermediatePositions() {
            return [];
        }
    },
    bishop: {
        moveIsLegal: function bishopMoveIsLegal(move) {
            return move.rankDistance() == move.fileDistance();
        }
    },
    queen: {
        moveIsLegal: function queenMoveIsLegal(move) {
            return pieceRules.rook.moveIsLegal(move) ||
                pieceRules.bishop.moveIsLegal(move);
        }
    },
    king: {
        moveIsLegal: function kingMoveIsLegal(move) {
            return move.rankDistance() <= 1 && move.fileDistance() <= 1;
        }
    },
    pawn: {
        moveIsLegal: function pawnMoveIsLegal(move) {
            var rd = move.rankDistance(),
                fd = move.fileDistance(),
                validCaptureMovement = fd == 1 && rd == 1,
                validNonCaptureMovement = fd == 0 && (rd == 1 ||
                (rd == 2 && (move.fromPos[0] == 6 || move.fromPos[0] == 1)));
            return validCaptureMovement || validNonCaptureMovement;
        }
    }
};

var pieceName = function pieceName(color, type) {
    return color + " " + type;
};

var extend = function extend(target) { // extend(target, ...sources)
    var i, source, prop;
    for (i = 1; i < arguments.length; i++) {
        source = arguments[i];
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};

var createPiece = function createPiece(color, type) {
    var Piece = function Piece() {};
    var names = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
    var index = names.indexOf(type);
    var codepoint = index != -1 ? 9818 + names.indexOf(type) : 32;

    return extend(new Piece(), pieceRules.defaults, pieceRules[type], {
        color: color,
        type: type,
        name: pieceName(color, type),
        symbol: '&#' + codepoint + ';'
    });
};

var WHITE_ROOK = createPiece('white', 'rook');
var WHITE_KNIGHT = createPiece('white', 'knight');
var WHITE_BISHOP = createPiece('white', 'bishop');
var WHITE_QUEEN = createPiece('white', 'queen');
var WHITE_KING = createPiece('white', 'king');
var WHITE_PAWN = createPiece('white', 'pawn');

var BLACK_ROOK = createPiece('black', 'rook');
var BLACK_KNIGHT = createPiece('black', 'knight');
var BLACK_BISHOP = createPiece('black', 'bishop');
var BLACK_QUEEN = createPiece('black', 'queen');
var BLACK_KING = createPiece('black', 'king');
var BLACK_PAWN = createPiece('black', 'pawn');

var EMPTY = createPiece('none', 'none');

var createMove = function createMove(fromPos, toPos) {
    var Move = function Move() {};

    return extend(new Move(), {
        fromPos: fromPos,
        toPos: toPos,

        rankDistance: function rankDistance() {
            return Math.abs(toPos[0] - fromPos[0]);
        },

        fileDistance: function fileDistance() {
            return Math.abs(toPos[1] - fromPos[1]);
        },

        staysInRank: function staysInRank() {
            return this.rankDistance(fromPos, toPos) === 0;
        },

        staysInFile: function staysInFile() {
            return this.fileDistance(fromPos, toPos) === 0;
        },

        rankDirection: function rankDirection() {
            return Math.sign(toPos[0] - fromPos[0]);
        },

        fileDirection: function fileDirection() {
            return Math.sign(toPos[1] - fromPos[1]);
        },

        lineOfSight: function lineOfSight() {
            var positions = [];
            var rank = fromPos[0] + this.rankDirection();
            var file = fromPos[1] + this.fileDirection();
            while (rank !== toPos[0] || file !== toPos[1]) {
                positions.push([rank, file]);
                rank += Math.sign(toPos[0] - rank);
                file += Math.sign(toPos[1] - file);
            }
            return positions;
        },

        // this function only makes sense to call if the move is a castling move
        rooksMove: function rooksMove() {
            var rank = fromPos[0],
                kingsSide = toPos[1] > fromPos[1],
                rookFromPos = [rank, kingsSide ? 7 : 0],
                rookToPos = [rank, kingsSide ? 5 : 3];
            return createMove(rookFromPos, rookToPos);
        }
    });
};

var pawnAdvanceDirection = function pawnAdvanceDirection(color) {
    return { white: -1, black: +1 }[color];
};

var rules = {
    isLegal: function isLegal(move, state) {
        var fromPos = move.fromPos,
            toPos = move.toPos,
            piece = state.pieceAt(fromPos),
            color = piece.color;

        if (color != state.playerOnTurn) {
            return false;
        }

        if (this.isCastling(move, state)) {
            return true;
        }

        if (this.isEnPassant(move, state)) {
            return true;
        }

        if (!piece.moveIsLegal(move)) {
            return false;
        }

        var squares = piece.intermediatePositions(move);
        if (!state.allSquaresEmpty(squares)) {
            return false;
        }

        var targetSquare = state.pieceAt(toPos);
        if (targetSquare.color == color) {
            return false;
        }

        if (piece.type == 'pawn') {
            if (move.rankDirection() != pawnAdvanceDirection(color)) {
                return false;
            }
            var isCapture = targetSquare != EMPTY;
            var isCapturingMovement =
                move.rankDistance() == 1 && move.fileDistance() == 1;
            if (isCapture != isCapturingMovement) {
                return false;
            }
        }

        return true;
    },
    isCastling: function isCastling(move, state) {
        var kingPos = move.fromPos;
        var piece = state.pieceAt(kingPos);
        var pieceIsKing = piece.type === 'king';
        if (!pieceIsKing) {
            return false;
        }

        var playerOnTurn = state.playerOnTurn;
        var playersKing = pieceName(playerOnTurn, 'king');
        var kingAlreadyMoved = state.piecesMoved[playersKing];
        if (kingAlreadyMoved) {
            return false;
        }

        var toPos = move.toPos;
        var kingDirection = move.fileDirection();
        var kingsOrQueens = kingDirection == 1 ? "king's" : "queen's";
        var playersRook = pieceName(playerOnTurn, 'rook');
        var rookName = kingsOrQueens + " " + playersRook;
        var rookAlreadyMoved = state.piecesMoved[rookName];
        if (rookAlreadyMoved) {
            return false;
        }

        var rank = kingPos[0];
        if (rank !== 0 && rank !== 7) {
            return false;
        }

        var rookFromFile = kingDirection == 1 ? 7 : 0;
        var rookFromPos = [rank, rookFromFile];
        var squares = createMove(rookFromPos, kingPos).lineOfSight();

        return state.allSquaresEmpty(squares);
    },
    isEnPassant: function isEnPassant(move, state) {
        var enPassant = state.enPassant;
        var fromPos = move.fromPos;
        var toPos = move.toPos;
        var piece = state.pieceAt(fromPos);
        return piece.type === 'pawn' &&
            enPassant.isPossible &&
            enPassant.capturePos &&
            enPassant.capturePos[0] === toPos[0] &&
            enPassant.capturePos[1] === toPos[1];
    },
    isPawnDoubleAdvance: function isPawnDoubleAdvance(move, state) {
        var fromPos = move.fromPos;
        var toPos = move.toPos;
        var piece = state.pieceAt(fromPos);
        var ranksMoved = Math.abs(toPos[0] - fromPos[0]);
        return piece.type === 'pawn' && ranksMoved == 2;
    }
};

var oppositePlayer = function oppositePlayer(color) {
    return color === 'white' ? 'black' : 'white';
};

var createState = function createState(layout) {
    var i, j;

    if (layout !== "chess" && layout !== "empty") {
        throw new Error("Unrecognized layout type '" + layout + "'");
    }

    var board = [];
    for (i = 0; i < 8; i++) {
        var row = [];
        for (j = 0; j < 8; j++) {
            row.push(EMPTY);
        }
        board.push(row);
    }

    if (layout === "chess") {
        var br = BLACK_ROOK, bn = BLACK_KNIGHT, bb = BLACK_BISHOP,
            bq = BLACK_QUEEN, bk = BLACK_KING, bp = BLACK_PAWN,
            wr = WHITE_ROOK, wn = WHITE_KNIGHT, wb = WHITE_BISHOP,
            wq = WHITE_QUEEN, wk = WHITE_KING, wp = WHITE_PAWN,
            __ = EMPTY;

        board = [
            [br, bn, bb, bq, bk, bb, bn, br],
            [bp, bp, bp, bp, bp, bp, bp, bp],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [wp, wp, wp, wp, wp, wp, wp, wp],
            [wr, wn, wb, wq, wk, wb, wn, wr]
        ];
    }

    var removePiece = function removePiece(pos) {
        var rank = pos[0],
            file = pos[1];
        board[rank][file] = EMPTY;
    };

    var movePiece = function movePiece(move) {
        var fromRank = move.fromPos[0],
            fromFile = move.fromPos[1],
            toRank   = move.toPos[0],
            toFile   = move.toPos[1];
        board[toRank][toFile] = board[fromRank][fromFile];
        removePiece(move.fromPos);
    };

    var piecesMoved = {};
    var markPieceMoved = function markPieceMoved(pos) {
        var rank = pos[0];
        var file = pos[1];
        var piece = board[rank][file];
        piecesMoved[piece.name] = true;
        if (piece.type === 'rook') {
            if (rank !== 0 && rank !== 7) {
                return;
            }
            var kingsOrQueens = file === 0 ? "queen's" :
                                file === 7 ? "king's"  :
                                            undefined;
            if (!kingsOrQueens) {
                return;
            }
            piecesMoved[kingsOrQueens + " " + piece.name] = true;
        }
    };

    var State = function State() {};
    return extend(new State(), {
        playerOnTurn: 'white',

        piecesMoved: piecesMoved,

        enPassant: {
            isPossible: false,
            capturePos: undefined
        },

        board: board,

        pieceAt: function pieceAt(pos) {
            return board[pos[0]][pos[1]];
        },

        allSquaresEmpty: function allSquaresEmpty(positions) {
            return positions.every(function (pos) {
                return this.pieceAt(pos) === EMPTY;
            }.bind(this));
        },

        makeMove: function makeMove(fromPos, toPos) {
            // allow two position arguments to auto-coerce to a move
            var move;
            if (fromPos instanceof Array &&
                    fromPos.length == 2 &&
                    toPos instanceof Array &&
                    toPos.length == 2) {
                move = createMove(fromPos, toPos);
            } else {
                move = fromPos; // it wasn't a pos, so it's a move
                fromPos = move.fromPos;
                toPos = move.toPos;
            }

            if (rules.isCastling(move, this)) {
                movePiece(move.rooksMove());
            }
            markPieceMoved(move.fromPos);

            if (rules.isEnPassant(move, this)) {
                removePiece(this.enPassant.pawnPos);
            }
            if (rules.isPawnDoubleAdvance(move, this)) {
                this.enPassant.isPossible = true;
                this.enPassant.pawnPos = move.toPos;
                var piece = this.pieceAt(move.fromPos);
                var delta = piece.color === 'white' ? +1 : -1;
                this.enPassant.capturePos =
                    [move.toPos[0] + delta, move.toPos[1]];
            } else {
                this.enPassant.isPossible = false;
            }

            movePiece(move);
            this.playerOnTurn = oppositePlayer(this.playerOnTurn);
        }
    });
};
