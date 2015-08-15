/*global createState, createMove, rules, QUnit, pieces, EMPTY */
(function testsIIFE() {
    'use strict';

    var checkMoves = function (assert, conf) {
        var state = createState('empty'),
            pos = conf.initPos,
            i = pos[0],
            j = pos[1],
            piece = conf.piece,
            newPos,
            move;
        state.board[i][j] = conf.piece;
        state.playerOnTurn = piece.color;

        for (i = 0; i < conf.legal.length; i++) {
            newPos = conf.legal[i];
            move = createMove(pos, newPos);
            assert.ok(rules.isLegal(move, state),
                "Legal: moving a " + piece.name +
                " from " + pos + " to " + newPos);
        }

        for (i = 0; i < conf.illegal.length; i++) {
            newPos = conf.illegal[i];
            move = createMove(pos, newPos);
            assert.ok(!rules.isLegal(move, state),
                "Illegal: moving a " + piece.name +
                " from " + pos + " to " + newPos);
        }
    };

    QUnit.test("rook moves", function (assert) {
        checkMoves(assert, {
            piece: pieces.white.rook,
            initPos: [5, 4],
            legal: [
                [7, 4],
                [0, 4],
                [5, 2],
                [5, 6]
            ],
            illegal: [
                [6, 5]
            ]
        });
    });

    QUnit.test("knight moves", function (assert) {
        checkMoves(assert, {
            piece: pieces.white.knight,
            initPos: [5, 4],
            legal: [
                [3, 3],
                [4, 2],
                [4, 6],
                [7, 5]
            ],
            illegal: [
                [5, 5],
                [5, 6],
                [5, 7],
                [7, 6]
            ]
        });
    });

    QUnit.test("bishop moves", function (assert) {
        checkMoves(assert, {
            piece: pieces.white.bishop,
            initPos: [5, 4],
            legal: [
                [4, 5],
                [3, 6],
                [6, 5],
                [2, 1]
            ],
            illegal: [
                [5, 5],
                [5, 6],
                [5, 7],
                [4, 2]
            ]
        });
    });

    QUnit.test("queen moves", function (assert) {
        checkMoves(assert, {
            piece: pieces.white.queen,
            initPos: [5, 4],
            legal: [
                [7, 4],
                [0, 4],
                [5, 2],
                [5, 6],
                [4, 5],
                [3, 6],
                [6, 5],
                [2, 1]
            ],
            illegal: [
                [3, 3],
                [4, 2],
                [4, 6],
                [7, 5],
                [0, 0]
            ]
        });
    });

    QUnit.test("king moves", function (assert) {
        checkMoves(assert, {
            piece: pieces.white.king,
            initPos: [5, 4],
            legal: [
                [6, 4],
                [4, 4],
                [5, 3],
                [5, 5],
                [4, 5],
                [6, 5]
            ],
            illegal: [
                [7, 4],
                [0, 4],
                [5, 2],
                [5, 6],
                [3, 6],
                [2, 1],
                [3, 3],
                [4, 2],
                [7, 5],
                [0, 0]
            ]
        });
    });

    QUnit.test("pawn moves", function (assert) {
        checkMoves(assert, {
            piece: pieces.white.pawn,
            initPos: [5, 4],
            legal: [
                [4, 4]
            ],
            illegal: [
                [7, 4],
                [0, 4],
                [5, 2],
                [5, 6],
                [3, 6],
                [2, 1],
                [3, 3],
                [4, 2],
                [7, 5],
                [0, 0],
                [6, 4]
            ]
        });

        checkMoves(assert, {
            piece: pieces.black.pawn,
            initPos: [5, 4],
            legal: [
                [6, 4]
            ],
            illegal: [
                [7, 4],
                [0, 4],
                [5, 2],
                [5, 6],
                [3, 6],
                [2, 1],
                [3, 3],
                [4, 2],
                [7, 5],
                [0, 0],
                [4, 4]
            ]
        });
    });

    QUnit.test("turn alternates between players", function (assert) {
        var state = createState('chess');

        var move = createMove([1, 4], [2, 4]);
        assert.ok(!rules.isLegal(move, state), "black cannot start");

        state.makeMove([6, 4], [5, 4]);
        move = createMove([1, 4], [2, 4]);
        assert.ok(rules.isLegal(move, state),
                  "black can move after white made a move");
    });

    QUnit.test("pieces cannot take their own", function (assert) {
        var state = createState('empty');

        state.board[3][3] = pieces.white.queen;
        state.board[5][5] = pieces.white.pawn;
        state.board[7][3] = pieces.black.pawn;

        var takeOwnPawn = createMove([3, 3], [5, 5]);
        assert.ok(!rules.isLegal(takeOwnPawn, state), "can't take own piece");

        var takeOpponentPawn = createMove([3, 3], [7, 3]);
        assert.ok(rules.isLegal(takeOpponentPawn, state),
                  "can take opponent piece");
    });

    QUnit.test("moving and capturing pawns", function (assert) {
        var state = createState('empty');

        state.board[3][4] = pieces.white.pawn;
        state.board[2][4] = pieces.black.queen;

        var forwardToCapture = createMove([3, 4], [2, 4]);
        assert.ok(!rules.isLegal(forwardToCapture, state),
                  "can't capture by moving forward");
        var diagonalToMove = createMove([3, 4], [2, 5]);
        assert.ok(!rules.isLegal(diagonalToMove, state),
                  "can't do a normal move diagonally");

        state.board[2][4] = EMPTY;
        state.board[2][5] = pieces.black.queen;

        var forwardToMove = createMove([3, 4], [2, 4]);
        assert.ok(rules.isLegal(forwardToMove, state),
                  "can do a normal move forward");
        var diagonalToCapture = createMove([3, 4], [2, 5]);
        assert.ok(rules.isLegal(diagonalToCapture, state),
                  "can capture by moving diagonally");
    });

    QUnit.test("pieces cannot go through things", function (assert) {
        var state = createState('empty');

        state.board[1][1] = pieces.white.pawn;
        state.board[1][2] = pieces.white.rook;
        state.board[1][3] = pieces.white.bishop;
        state.board[1][4] = pieces.white.queen;

        state.board[2][1] = pieces.black.queen;
        state.board[6][2] = pieces.black.queen;
        state.board[2][3] = pieces.black.queen;
        state.board[3][5] = pieces.black.queen;
        state.board[2][5] = pieces.black.queen;

        var pawnThroughPiece = createMove([1, 1], [3, 1]);
        assert.ok(!rules.isLegal(pawnThroughPiece, state),
                  "pawn can't go through a piece");

        var rookThroughPiece = createMove([1, 2], [7, 2]);
        assert.ok(!rules.isLegal(rookThroughPiece, state),
                  "rook can't go through a piece");

        var bishopThroughPiece = createMove([1, 3], [5, 7]);
        assert.ok(!rules.isLegal(bishopThroughPiece, state),
                  "bishop can't go through a piece");

        var queenThoughPiece = createMove([1, 4], [3, 2]);
        assert.ok(!rules.isLegal(queenThoughPiece, state),
                  "queen can't go though a piece");
    });

    QUnit.test("the knight can go through things", function (assert) {
        var state = createState('empty');

        state.board[1][1] = pieces.white.knight;

        state.board[2][1] = pieces.black.pawn;
        state.board[1][2] = pieces.black.knight;
        state.board[2][2] = pieces.black.bishop;
        state.board[1][3] = pieces.black.queen;

        var knightOverPieces = createMove([1, 1], [2, 3]);
        assert.ok(rules.isLegal(knightOverPieces, state),
                  "knight can jump over pieces");
    });

    QUnit.test("castling is legal", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [5, 4])   // pawn opens for bishop
            .makeMove([1, 0], [2, 0])
            .makeMove([7, 5], [6, 4])   // bishop out of the way
            .makeMove([2, 0], [3, 0])
            .makeMove([7, 6], [5, 5])   // knight out of the way
            .makeMove([3, 0], [4, 0])
        ;

        var move = createMove([7, 4], [7, 6]);
        assert.ok(rules.isLegal(move, state), "white king can castle here");
        state.makeMove(move);
        assert.ok(state.board[7][7] === EMPTY, "rook also moved...");
        assert.ok(state.board[7][5] === pieces.white.rook, "...to here");
    });

    QUnit.test("castling is only legal if the rook is there", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [5, 4])   // pawn opens for bishop
            .makeMove([1, 0], [2, 0])
            .makeMove([7, 5], [6, 4])   // bishop out of the way
            .makeMove([2, 0], [3, 0])
            .makeMove([7, 6], [5, 5])   // knight out of the way
            .makeMove([3, 0], [4, 0])
            .makeMove([6, 7], [5, 7])   // pawn opens for rook
            .makeMove([4, 0], [5, 0])
            .makeMove([7, 7], [6, 7])   // rook moves!
            .makeMove([1, 1], [2, 1])
        ;

        var move = createMove([7, 4], [7, 6]);
        assert.ok(!rules.isLegal(move, state),
                    "can not castle -- the rook is not in the right place");
    });

    QUnit.test("can only castle if king hasn't moved yet", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [5, 4])   // pawn opens for bishop
            .makeMove([1, 0], [2, 0])
            .makeMove([7, 5], [5, 3])   // bishop out of the way
            .makeMove([2, 0], [3, 0])
            .makeMove([7, 6], [5, 5])   // knight out of the way
            .makeMove([3, 0], [4, 0])
            .makeMove([7, 4], [6, 4])   // king moves!
            .makeMove([4, 0], [5, 0])
            .makeMove([6, 4], [7, 4])   // king moves back, but it's too late
            .makeMove([1, 1], [2, 1])
        ;

        var move = createMove([7, 4], [7, 6]);
        assert.ok(!rules.isLegal(move, state),
                  "king can not castle because it already moved");
    });

    QUnit.test("can only castle if rook hasn't moved yet", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [5, 4])   // pawn opens for bishop
            .makeMove([1, 0], [2, 0])
            .makeMove([7, 5], [6, 4])   // bishop out of the way
            .makeMove([2, 0], [3, 0])
            .makeMove([7, 6], [5, 5])   // knight out of the way
            .makeMove([3, 0], [4, 0])
            .makeMove([7, 7], [7, 6])   // rook moves!
            .makeMove([4, 0], [5, 0])
            .makeMove([7, 6], [7, 7])   // rook moves back, but it's too late
            .makeMove([1, 1], [2, 1])
        ;

        var move = createMove([7, 4], [7, 6]);
        assert.ok(!rules.isLegal(move, state),
                    "white king can not castle because the rook already moved");
    });

    QUnit.test("only castle if king's path is clear", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [5, 4])   // pawn opens for bishop
            .makeMove([1, 0], [2, 0])
            .makeMove([7, 6], [5, 5])   // knight out of the way
            .makeMove([2, 0], [3, 0])
        ;

        var move = createMove([7, 4], [7, 6]);
        assert.ok(!rules.isLegal(move, state),
                    "white king can not castle -- bishop is standing in the way");
    });

    QUnit.test("only castle if queen's path is clear", function (assert) {
        var state = createState('chess')
            .makeMove([6, 3], [5, 3])   // pawn opens for bishop
            .makeMove([1, 0], [2, 0])
            .makeMove([7, 2], [6, 3])   // bishop out of the way
            .makeMove([2, 0], [3, 0])
            .makeMove([6, 4], [5, 4])   // pawn opens for queen
            .makeMove([3, 0], [4, 0])
            .makeMove([7, 3], [6, 4])   // queen out of the way
            .makeMove([4, 0], [5, 0])
        ;

        var move = createMove([7, 4], [7, 2]);
        assert.ok(!rules.isLegal(move, state),
                    "white king can not castle -- queen's knight is in the way");
    });

    QUnit.test("a pawn can advance two steps sometimes", function (assert) {
        var state = createState("chess");

        var move = createMove([6, 4], [4, 4]);
        assert.ok(rules.isLegal(move, state), "the pawn can advance two steps");

        state.makeMove([6, 4], [5, 4]);
        move = createMove([5, 4], [3, 4]);
        assert.ok(!rules.isLegal(move, state),
                  "...but only from its original rank");
    });

    QUnit.test("a pawn may not advance two steps and capture", function (assert) {
        var state = createState('chess')
            .makeMove([6, 7], [4, 7])
            .makeMove([1, 3], [3, 3])
            .makeMove([4, 7], [3, 7])
            .makeMove([3, 3], [4, 3])
        ;

        var move = createMove([6, 4], [4, 3]);
        assert.ok(!rules.isLegal(move, state),
                    "pawn cannot advance two steps and capture at the same time");
    });

    QUnit.test("a pawn may not advance through a piece", function (assert) {
        var state = createState('chess')
            .makeMove([6, 0], [4, 0])
            .makeMove([1, 3], [2, 3])   // open up for black bishop
            .makeMove([6, 1], [4, 1])
            .makeMove([0, 3], [5, 7])   // bishop moves in front of pawn
        ;

        var move = createMove([6, 7], [4, 7]);
        assert.ok(!rules.isLegal(move, state),
                    "pawn cannot move two steps through another piece");
    });

    QUnit.test("pawn en passant capture", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [4, 4])
            .makeMove([1, 0], [3, 0])
            .makeMove([4, 4], [3, 4])   // white pawn ready to en passant
            .makeMove([1, 3], [3, 3])   // black pawn advanced two steps
        ;

        var move = createMove([3, 4], [2, 3]);
        assert.ok(rules.isLegal(move, state), "pawn can capture en passant");
        state.makeMove(move);
        assert.ok(state.board[3][3] === EMPTY, "...and it took the pawn");
    });

    QUnit.test("can only en passant immediately afterwards", function (assert) {
        var state = createState('chess')
            .makeMove([6, 4], [4, 4])
            .makeMove([1, 0], [3, 0])
            .makeMove([4, 4], [3, 4])   // white pawn ready to en passant
            .makeMove([1, 3], [3, 3])   // black pawn advanced two steps
            .makeMove([6, 7], [5, 6])
            .makeMove([3, 0], [4, 0])   // two inconsequential moves
        ;
        
        var move = createMove([3, 4], [2, 3]);
        assert.ok(!rules.isLegal(move, state),
                  "pawn missed its chance to capture en passant");
    });

    // promotion

    // check
    // player cannot put himself into check
    // castling is only legal if the king is not currently in check
    // castling is only legal if the king does not pass through
    //    a square that is attacked by an enemy piece
    // checkmate
    // it's a stalemate if player is not in check but cannot move
}());
