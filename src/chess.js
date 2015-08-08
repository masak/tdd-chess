'use strict';

var rankDistance = function rankDistance(fromPos, toPos) {
    return Math.abs(toPos[0] - fromPos[0]);
};

var fileDistance = function fileDistance(fromPos, toPos) {
    return Math.abs(toPos[1] - fromPos[1]);
};

var sameRank = function sameRank(fromPos, toPos) {
    return rankDistance(fromPos, toPos) === 0;
};

var sameFile = function sameFile(fromPos, toPos) {
    return fileDistance(fromPos, toPos) === 0;
};

var rankDirection = function rankDirection(fromPos, toPos) {
    return Math.sign(toPos[0] - fromPos[0]);
};

var fileDirection = function fileDirection(fromPos, toPos) {
    return Math.sign(toPos[1] - fromPos[1]);
};

var lineOfSight = function lineOfSight(fromPos, toPos) {
    var rd = rankDirection(fromPos, toPos);
    var rf = fileDirection(fromPos, toPos);
    var positions = [];
    var rank = fromPos[0] + rd;
    var file = fromPos[1] + rf;
    while (rank !== toPos[0] || file !== toPos[1]) {
        positions.push([rank, file]);
        rank += rd;
        file += rf;
    }
    return positions;
};

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
            return sameRank(fromPos, toPos) || sameFile(fromPos, toPos);
        },
        between: function rookBetween(fromPos, toPos) {
            return this.moveIsLegal(fromPos, toPos)
                ? lineOfSight(fromPos, toPos)
                : [];
        }
    },
    knight: {
        moveIsLegal: function knightMoveIsLegal(fromPos, toPos) {
            var rd = rankDistance(fromPos, toPos);
            var fd = fileDistance(fromPos, toPos);
            return rd == 1 && fd == 2 || rd == 2 && fd == 1;
        }
    },
    bishop: {
        moveIsLegal: function bishopMoveIsLegal(fromPos, toPos) {
            var rd = rankDistance(fromPos, toPos);
            var fd = fileDistance(fromPos, toPos);
            return rd == fd;
        },
        between: function bishopBetween(fromPos, toPos) {
            return this.moveIsLegal(fromPos, toPos)
                ? lineOfSight(fromPos, toPos)
                : [];
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
            var rd = rankDistance(fromPos, toPos);
            var fd = fileDistance(fromPos, toPos);
            return rd <= 1 && fd <= 1;
        }
    },
    pawn: {
        moveIsLegal: function pawnMoveIsLegal(fromPos, toPos, color, isCapture) {
            var allowedDirection = color == 'white' ? -1 : +1;
            var rd = rankDistance(fromPos, toPos);
            var fd = fileDistance(fromPos, toPos);
            var oneSquareAdvance = rd == 1;
            var twoSquareAdvance = rd == 2 &&
                fromPos[0] == (color == 'white' ? 6 : 1);
            var validCaptureMovement = fd == 1 && oneSquareAdvance;
            var validNonCaptureMovement =
                fd == 0 && (oneSquareAdvance || twoSquareAdvance);
            return rankDirection(fromPos, toPos) == allowedDirection &&
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
        var piece = state.pieceAt(fromPos);
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

        var squares = piece.between(fromPos, toPos);
        if (!state.allSquaresEmpty(squares)) {
            return false;
        }

        var targetSquare = state.pieceAt(toPos);
        if (targetSquare.color == color) {
            return false;
        }

        var isCapture = targetSquare != EMPTY;
        return piece.moveIsLegal(fromPos, toPos, color, isCapture);
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
        var kingDirection = fileDirection(kingPos, toPos);
        var kingsOrQueens = kingDirection == 1 ? "king's" : "queen's";
        var playersRook = pieceName(playerOnTurn, 'rook');
        var rookAlreadyMoved = state.piecesMoved[kingsOrQueens + " " + playersRook];
        if (rookAlreadyMoved) {
            return false;
        }

        var rank = kingPos[0];
        if (rank !== 0 && rank !== 7) {
            return false;
        }

        var rookFromFile = kingDirection == 1 ? 7 : 0;
        var rookFromPos = [rank, rookFromFile];
        var squares = lineOfSight(rookFromPos, kingPos);

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

        pieceAt: function pieceAt(pos) {
            return board[ pos[0] ][ pos[1] ];
        },

        allSquaresEmpty: function allSquaresEmpty(positions) {
            return positions.every(function(pos) {
                return this.pieceAt(pos) === EMPTY;
            }.bind(this));
        },

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
                var piece = this.pieceAt( move.fromPos );
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
