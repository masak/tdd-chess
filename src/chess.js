'use strict';

var pieceRules = {
    defaults: {
        moveIsLegal: function moveIsNeverLegalByDefault() {
            return false;
        },
        between: function noPiecesBetweenByDefault() {
            return [];
        }
    },
    rook: {
        moveIsLegal: function rookMoveIsLegal(fromPos, toPos) {
            return fromPos[0] == toPos[0] || fromPos[1] == toPos[1];
        },
        between: function rookBetween(fromPos, toPos) {
            var dr = Math.sign(toPos[0] - fromPos[0]);
            var df = Math.sign(toPos[1] - fromPos[1]);
            if (Math.abs(dr) + Math.abs(df) != 1) {
                return [];
            }
            var positions = [];
            var rank = fromPos[0] + dr;
            var file = fromPos[1] + df;
            while (rank !== toPos[0] || file !== toPos[1]) {
                positions.push([rank, file]);
                rank += dr;
                file += df;
            }
            return positions;
        }
    },
    knight: {
        moveIsLegal: function knightMoveIsLegal(fromPos, toPos) {
            var dr = toPos[0] - fromPos[0];
            var df = toPos[1] - fromPos[1];
            return Math.abs(dr) == 1 && Math.abs(df) == 2 ||
                Math.abs(dr) == 2 && Math.abs(df) == 1;
        }
    },
    bishop: {
        moveIsLegal: function bishopMoveIsLegal(fromPos, toPos) {
            var dr = toPos[0] - fromPos[0];
            var df = toPos[1] - fromPos[1];
            return Math.abs(dr) == Math.abs(df);
        },
        between: function bishopBetween(fromPos, toPos) {
            var dr = Math.sign(toPos[0] - fromPos[0]);
            var df = Math.sign(toPos[1] - fromPos[1]);
            if (Math.abs(dr) != 1 || Math.abs(df) != 1) {
                return [];
            }
            var positions = [];
            var rank = fromPos[0] + dr;
            var file = fromPos[1] + df;
            while (rank != toPos[0]) {
                positions.push([rank, file]);
                rank += dr;
                file += df;
            }
            return positions;
        }
    },
    queen: {
        moveIsLegal: function queenMoveIsLegal(fromPos, toPos) {
            return pieceRules.rook.moveIsLegal(fromPos, toPos) ||
                pieceRules.bishop.moveIsLegal(fromPos, toPos);
        },
        between: function queenBetween(fromPos, toPos) {
            return pieceRules.rook.between(fromPos, toPos).concat(
                pieceRules.bishop.between(fromPos, toPos));
        }
    },
    king: {
        moveIsLegal: function kingMoveIsLegal(fromPos, toPos) {
            var dr = toPos[0] - fromPos[0];
            var df = toPos[1] - fromPos[1];
            var moveIsOneStep = Math.abs(dr) <= 1 && Math.abs(df) <= 1;
            return moveIsOneStep;
        }
    },
    pawn: {
        moveIsLegal: function pawnMoveIsLegal(fromPos, toPos, color, isCapture) {
            var allowedDirection = color == 'white' ? -1 : +1;
            var ranksMoved = Math.abs(toPos[0] - fromPos[0]);
            var filesMoved = Math.abs(toPos[1] - fromPos[1]);
            var oneSquareAdvance = ranksMoved == 1;
            var twoSquareAdvance = ranksMoved == 2 &&
                fromPos[0] == (color == 'white' ? 6 : 1);
            var validCaptureMovement =
                filesMoved == 1 && oneSquareAdvance;
            var validNonCaptureMovement =
                filesMoved == 0 && (oneSquareAdvance || twoSquareAdvance);
            return Math.sign(toPos[0] - fromPos[0]) == allowedDirection &&
                (isCapture ? validCaptureMovement : validNonCaptureMovement);
        }
    }
};

var pieceName = function pieceName(color, type) {
    return color + " " + type;
};

var extend = function extend(target /*, sources */) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var prop in source) {
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
    var codepoint = 9818 + names.indexOf(type);

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

var EMPTY = {
    color: "none",
    type: "empty square",
    name: "empty square",
    symbol: ""
};

var createMove = function createMove(fromPos, toPos) {
    var Move = function Move() {};

    return extend(new Move(), {
        fromPos: fromPos,
        toPos: toPos
    });
};

var rules = {
    isLegal: function isLegal(move, state) {
        var fromPos = move.fromPos;
        var toPos = move.toPos;
        var piece = state.board[ fromPos[0] ][ fromPos[1] ];
        var color = piece.color;

        if (color != state.playerOnTurn) {
            return false;
        }

        if (this.isCastling(move, state)) {
            return true;
        }

        if (this.isEnPassant(move, state)) {
            return true;
        }

        var positionsBetween = piece.between(fromPos, toPos);
        for (var i = 0; i < positionsBetween.length; i++) {
            var pos = positionsBetween[i];
            if (state.board[ pos[0] ][ pos[1] ] != EMPTY) {
                return false;
            }
        }

        var targetSquare = state.board[ toPos[0] ][ toPos[1] ];
        if (targetSquare.color == color) {
            return false;
        }

        var isCapture = targetSquare != EMPTY;
        return piece.moveIsLegal(fromPos, toPos, color, isCapture);
    },
    isCastling: function isCastling(move, state) {
        var kingPos = move.fromPos;
        var piece = state.board[ kingPos[0] ][ kingPos[1] ];
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
        var kingsOrQueens = toPos[1] > kingPos[1] ? "king's" : "queen's";
        var playersRook = pieceName(playerOnTurn, 'rook');
        var rookAlreadyMoved = state.piecesMoved[kingsOrQueens + " " + playersRook];
        if (rookAlreadyMoved) {
            return false;
        }

        var rank = kingPos[0];
        if (rank !== 0 && rank !== 7) {
            return false;
        }

        var rookFromFile = toPos[1] > kingPos[1] ? 7 : 0;
        var rookFromPos = [rank, rookFromFile];
        var positionsBetweenForRook = pieceRules.rook.between(rookFromPos, kingPos);
        for (var i = 0; i < positionsBetweenForRook.length; i++) {
            var pos = positionsBetweenForRook[i];
            if (state.board[ pos[0] ][ pos[1] ] !== EMPTY) {
                return false;
            }
        }

        return true;
    },
    isEnPassant: function isEnPassant(move, state) {
        var enPassant = state.enPassant;
        var fromPos = move.fromPos;
        var toPos = move.toPos;
        var piece = state.board[ fromPos[0] ][ fromPos[1] ];
        return piece.type === 'pawn' &&
            enPassant.isPossible &&
            enPassant.capturePos &&
            enPassant.capturePos[0] === toPos[0] &&
            enPassant.capturePos[1] === toPos[1];
    },
    isPawnDoubleAdvance: function isPawnDoubleAdvance(move, state) {
        var fromPos = move.fromPos;
        var toPos = move.toPos;
        var piece = state.board[ fromPos[0] ][ fromPos[1] ];
        var ranksMoved = Math.abs(toPos[0] - fromPos[0]);
        return piece.type === 'pawn' && ranksMoved == 2;
    }
};

var oppositePlayer = function oppositePlayer(color) {
    return color === 'white' ? 'black' : 'white';
};

var createState = function createState(layout) {
    if (layout !== "chess" && layout !== "empty") {
        throw new Error("Unrecognized layout type '" + layout + "'");
    }

    var board = [];
    for (var i = 0; i < 8; i++) {
        var row = [];
        for (var j = 0; j < 8; j++) {
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
            board[row] = chessLayout[row];
        }
    }

    var movePieceOnBoard = function movePieceOnBoard(move) {
        var fromPos = move.fromPos;
        var toPos = move.toPos;
        var fromRank = fromPos[0],
            fromFile = fromPos[1],
            toRank   = toPos[0],
            toFile   = toPos[1];
        board[toRank][toFile] = board[fromRank][fromFile];
        board[fromRank][fromFile] = EMPTY;
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

        makeMove: function makeMove(move) {
            // allow two position arguments to auto-coerce to a move
            if (arguments.length == 2
                && arguments[0] instanceof Array
                && arguments[0].length == 2
                && arguments[1] instanceof Array
                && arguments[1].length == 2) {

                move = createMove(arguments[0], arguments[1]);
            }

            if (rules.isCastling(move, this)) {
                var rank = move.fromPos[0];
                var rookFromFile = move.toPos[1] > move.fromPos[1] ? 7 : 0;
                var rookToFile = move.toPos[1] > move.fromPos[1] ? 5 : 3;
                var rookFromPos = [rank, rookFromFile];
                var rookToPos = [rank, rookToFile];

                movePieceOnBoard(createMove(rookFromPos, rookToPos));
            }
            markPieceMoved(move.fromPos);

            if (rules.isEnPassant(move, this)) {
                var pawnRank = this.enPassant.pawnPos[0],
                    pawnFile = this.enPassant.pawnPos[1];
                this.board[pawnRank][pawnFile] = EMPTY;
            }
            if (rules.isPawnDoubleAdvance(move, this)) {
                this.enPassant.isPossible = true;
                this.enPassant.pawnPos = move.toPos;
                var piece = this.board[ move.fromPos[0] ][ move.fromPos[1] ];
                var delta = piece.color === 'white' ? +1 : -1;
                this.enPassant.capturePos = [move.toPos[0] + delta, move.toPos[1]];
            }
            else {
                this.enPassant.isPossible = false;
            }

            movePieceOnBoard(move);
            this.playerOnTurn = oppositePlayer(this.playerOnTurn);
        }
    });
};
