var createMove, rules, createState, WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP,
    WHITE_QUEEN, WHITE_KING, WHITE_PAWN, BLACK_ROOK, BLACK_KNIGHT,
    BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_PAWN, EMPTY;

(function () {
    'use strict';

    var player = {
        white: {
            homeRank: 7,
            pawnRank: 6,
            pawnAdvanceDirection: -1,
            opponent: 'black'
        },
        black: {
            homeRank: 0,
            pawnRank: 1,
            pawnAdvanceDirection: +1,
            opponent: 'white'
        }
    };

    var pieceRules = {
        defaults: {
            moveIsLegal: function moveIsNeverLegalByDefault(move) {
                return false;
            },
            path: function path(fromPos, toPos) {
                var positions = [];
                var rank = fromPos[0] + Math.sign(toPos[0] - fromPos[0]);
                var file = fromPos[1] + Math.sign(toPos[1] - fromPos[1]);
                while (rank !== toPos[0] || file !== toPos[1]) {
                    positions.push([rank, file]);
                    rank += Math.sign(toPos[0] - rank);
                    file += Math.sign(toPos[1] - file);
                }
                return positions;
            },
            pawnCheck: function pawnCheckIsTrueByDefault(move, state) {
                return true;
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
            path: function knightPathIsEmpty() {
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
                    (rd == 2 && (move.fromPos[0] == player.white.pawnRank ||
                                 move.fromPos[0] == player.black.pawnRank)));
                return validCaptureMovement || validNonCaptureMovement;
            },
            pawnCheck: function pawnCheck(move, state) {
                var toPos = move.toPos,
                    color = state.pieceAt(move.fromPos).color,
                    captures = !state.emptyPosAt(toPos),
                    pawnMovesToCapture = move.rankDistance() == 1
                        && move.fileDistance() == 1;
                return move.rankDirection() ==
                    player[color].pawnAdvanceDirection &&
                    captures == pawnMovesToCapture;
            }
        }
    };

    var pieceName = function pieceName(color, type) {
        return color + " " + type;
    };

    var extend = function extend(target) { // extend(target, ...sources)
        var i, prop;
        for (i = 1; i < arguments.length; i++) {
            var source = arguments[i];
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

    WHITE_ROOK = createPiece('white', 'rook');
    WHITE_KNIGHT = createPiece('white', 'knight');
    WHITE_BISHOP = createPiece('white', 'bishop');
    WHITE_QUEEN = createPiece('white', 'queen');
    WHITE_KING = createPiece('white', 'king');
    WHITE_PAWN = createPiece('white', 'pawn');

    BLACK_ROOK = createPiece('black', 'rook');
    BLACK_KNIGHT = createPiece('black', 'knight');
    BLACK_BISHOP = createPiece('black', 'bishop');
    BLACK_QUEEN = createPiece('black', 'queen');
    BLACK_KING = createPiece('black', 'king');
    BLACK_PAWN = createPiece('black', 'pawn');

    EMPTY = createPiece('none', 'none');

    createMove = function createMove(fromPos, toPos) {
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

            // this function only makes sense to call
            // after the move has been confirmed to be
            // a castling move
            rooksMove: function rooksMove() {
                var rank = fromPos[0],
                    kingsSide = toPos[1] > fromPos[1],
                    rookFromPos = [rank, kingsSide ? 7 : 0],
                    rookToPos = [rank, kingsSide ? 5 : 3];
                return createMove(rookFromPos, rookToPos);
            }
        });
    };

    rules = {
        isLegal: function isLegal(move, state) {
            var piece = state.pieceAt(move.fromPos),
                isNormalMove = piece.moveIsLegal(move) &&
                     state.pathIsClear(move.fromPos, move.toPos) &&
                     state.pieceAt(move.toPos).color != piece.color &&
                     piece.pawnCheck(move, state),
                isCastlingOrEnPassantOrNormal =
                    this.isCastling(move, state) ||
                    this.isEnPassant(move, state) ||
                    isNormalMove;

            return piece.color == state.playerOnTurn &&
                isCastlingOrEnPassantOrNormal;
        },
        isCastling: function isCastling(move, state) {
            var kingPos = move.fromPos,
                piece = state.pieceAt(kingPos),
                pieceIsKing = piece.type === 'king',
                playerOnTurn = state.playerOnTurn,
                playersKing = pieceName(playerOnTurn, 'king'),
                kingAlreadyMoved = state.piecesMoved[playersKing],
                toPos = move.toPos,
                kingDirection = move.fileDirection(),
                kingsOrQueens = kingDirection == 1 ? "king's" : "queen's",
                playersRook = pieceName(playerOnTurn, 'rook'),
                rookName = kingsOrQueens + " " + playersRook,
                rookAlreadyMoved = state.piecesMoved[rookName],
                rank = kingPos[0],
                rookFromFile = kingDirection == 1 ? 7 : 0,
                rookFromPos = [rank, rookFromFile];

            return pieceIsKing &&
                !kingAlreadyMoved &&
                !rookAlreadyMoved &&
                rank === player[piece.color].homeRank &&
                state.pieceAt(rookFromPos).type == 'rook' &&
                state.pathIsClear(rookFromPos, kingPos);
        },
        isEnPassant: function isEnPassant(move, state) {
            var piece = state.pieceAt(move.fromPos),
                previousMove = state.previousMove,
                offset = player[piece.color].pawnAdvanceDirection,
                pawnJustDoubleAdvanced =
                    previousMove &&
                    previousMove.rankDistance() === 2 &&
                    previousMove.toPos[0] + offset === move.toPos[0] &&
                    previousMove.toPos[1] === move.toPos[1];

            return piece.type === 'pawn' && pawnJustDoubleAdvanced;
        }
    };

    var isPosition = function isPosition(pos) {
        return pos instanceof Array && pos.length == 2 &&
            typeof pos[0] === "number" && typeof pos[1] === "number";
    };

    createState = function createState(layout) {
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

        var piecesMoved = {};

        var pieceAt = function pieceAt(pos) {
            return board[pos[0]][pos[1]];
        };

        var emptyPosAt = function emptyPosAt(pos) {
            return pieceAt(pos) == EMPTY;
        };

        var movePiece = function movePiece(move) {
            var fromRank = move.fromPos[0],
                fromFile = move.fromPos[1],
                toRank   = move.toPos[0],
                toFile   = move.toPos[1];
            var piece = pieceAt(move.fromPos);
            board[toRank][toFile] = piece;
            removePiece(move.fromPos);

            var kingsOrQueens = {
                "0;0": "queen's ",
                "7;0": "queen's ",
                "0;7": "king's ",
                "7;7": "king's "
            }[fromRank + ";" + fromFile] || "";
            piecesMoved[kingsOrQueens + piece.name] = true;
        };

        var State = function State() {};
        return extend(new State(), {
            playerOnTurn: 'white',

            piecesMoved: piecesMoved,

            previousMove: undefined,

            board: board,

            pieceAt: pieceAt,

            emptyPosAt: emptyPosAt,

            pathIsClear: function pathIsClear(fromPos, toPos) {
                var piece = this.pieceAt(fromPos);
                return piece.path(fromPos, toPos).every(emptyPosAt);
            },

            makeMove: function makeMove(fromPos, toPos) {
                var needsCoercion = isPosition(fromPos) && isPosition(toPos),
                    move = needsCoercion ? createMove(fromPos, toPos) : fromPos;

                if (rules.isCastling(move, this)) {
                    movePiece(move.rooksMove());
                }

                if (rules.isEnPassant(move, this)) {
                    removePiece(this.previousMove.toPos);
                }

                movePiece(move);
                this.playerOnTurn = player[this.playerOnTurn].opponent;
                this.previousMove = move;

                return this;
            }
        });
    };
}());
