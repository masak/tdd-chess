'use strict';

var testState = gameState.clone();

var checkMoves = function(assert, conf) {
    testState.reset();
    var pos = conf.initPos,
        i = pos[0],
        j = pos[1],
        piece = conf.piece;
    testState.board[i][j] = conf.piece;
    testState.playerOnTurn = piece.color;

    for (var i in conf.legal) {
        var newPos = conf.legal[i];
        var move = new Move(testState, pos, newPos);
        assert.ok(move.isLegal(), "Legal: moving a " + piece.name + " from " + pos + " to " + newPos);
    }

    for (var i in conf.illegal) {
        var newPos = conf.illegal[i];
        var move = new Move(testState, pos, newPos);
        assert.ok(!move.isLegal(), "Illegal: moving a " + piece.name + " from " + pos + " to " + newPos);
    }
};

QUnit.test( "rook moves", function( assert ) {
    checkMoves(assert, {
        piece: Piece.WHITE_ROOK,
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

QUnit.test( "knight moves", function( assert ) {
    checkMoves(assert, {
        piece: Piece.WHITE_KNIGHT,
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

QUnit.test( "bishop moves", function( assert ) {
    checkMoves(assert, {
        piece: Piece.WHITE_BISHOP,
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

QUnit.test( "queen moves", function( assert ) {
    checkMoves(assert, {
        piece: Piece.WHITE_QUEEN,
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

QUnit.test( "king moves", function( assert ) {
    checkMoves(assert, {
        piece: Piece.WHITE_KING,
        initPos: [5, 4],
        legal: [
            [6, 4],
            [4, 4],
            [5, 3],
            [5, 5],
            [4, 5],
            [6, 5],
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

QUnit.test( "pawn moves", function( assert ) {
    checkMoves(assert, {
        piece: Piece.WHITE_PAWN,
        initPos: [5, 4],
        legal: [
            [4, 4],
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
        piece: Piece.BLACK_PAWN,
        initPos: [5, 4],
        legal: [
            [6, 4],
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

QUnit.test( "turn alternates between players", function( assert ) {
    testState.chess();

    var move = new Move(testState, [1, 4], [2, 4]);
    assert.ok(!move.isLegal(), "black cannot start");

    new Move(testState, [6, 4], [5, 4]).make();
    move = new Move(testState, [1, 4], [2, 4]);
    assert.ok(move.isLegal(), "black can move after white made a move");
});

QUnit.test( "pieces cannot take their own", function( assert ) {
    testState.reset();

    testState.board[3][3] = Piece.WHITE_QUEEN;
    testState.board[5][5] = Piece.WHITE_PAWN;
    testState.board[7][3] = Piece.BLACK_PAWN;

    var takeOwnPawn = new Move(testState, [3, 3], [5, 5]);
    assert.ok(!takeOwnPawn.isLegal(), "can't take own piece");

    var takeOpponentPawn = new Move(testState, [3, 3], [7, 3]);
    assert.ok(takeOpponentPawn.isLegal(), "can take opponent piece");
});

QUnit.test( "moving and capturing pawns", function( assert ) {
    testState.reset();

    testState.board[3][4] = Piece.WHITE_PAWN;
    testState.board[2][4] = Piece.BLACK_QUEEN;

    var forwardToCapture = new Move(testState, [3, 4], [2, 4]);
    assert.ok(!forwardToCapture.isLegal(), "can't capture by moving forward");
    var diagonalToMove = new Move(testState, [3, 4], [2, 5]);
    assert.ok(!diagonalToMove.isLegal(), "can't do a normal move diagonally");

    testState.board[2][4] = EMPTY;
    testState.board[2][5] = Piece.BLACK_QUEEN;

    var forwardToMove = new Move(testState, [3, 4], [2, 4]);
    assert.ok(forwardToMove.isLegal(), "can do a normal move forward");
    var diagonalToCapture = new Move(testState, [3, 4], [2, 5]);
    assert.ok(diagonalToCapture.isLegal(), "can capture by moving diagonally");
});

QUnit.test( "pieces cannot go through things", function( assert ) {
    testState.reset();

    testState.board[1][1] = Piece.WHITE_PAWN;
    testState.board[1][2] = Piece.WHITE_ROOK;
    testState.board[1][3] = Piece.WHITE_BISHOP;
    testState.board[1][4] = Piece.WHITE_QUEEN;

    testState.board[2][1] = Piece.BLACK_QUEEN;
    testState.board[6][2] = Piece.BLACK_QUEEN;
    testState.board[2][3] = Piece.BLACK_QUEEN;
    testState.board[3][5] = Piece.BLACK_QUEEN;
    testState.board[2][5] = Piece.BLACK_QUEEN;

    var pawnThroughPiece = new Move(testState, [1, 1], [3, 1]);
    assert.ok(!pawnThroughPiece.isLegal(), "pawn can't go through a piece");

    var rookThroughPiece = new Move(testState, [1, 2], [7, 2]);
    assert.ok(!rookThroughPiece.isLegal(), "rook can't go through a piece");

    var bishopThroughPiece = new Move(testState, [1, 3], [5, 7]);
    assert.ok(!bishopThroughPiece.isLegal(), "bishop can't go through a piece");

    var queenThoughPiece = new Move(testState, [1, 4], [3, 2]);
    assert.ok(!queenThoughPiece.isLegal(), "queen can't go though a piece");
});

QUnit.test( "the knight can go through things", function( assert ) {
    testState.reset();

    testState.board[1][1] = Piece.WHITE_KNIGHT;

    testState.board[2][1] = Piece.BLACK_PAWN;
    testState.board[1][2] = Piece.BLACK_KNIGHT;
    testState.board[2][2] = Piece.BLACK_BISHOP;
    testState.board[1][3] = Piece.BLACK_QUEEN;

    var knightOverPieces = new Move(testState, [1, 1], [2, 3]);
    assert.ok(knightOverPieces.isLegal(), "knight can jump over pieces");
});

// castling

// pawn double step
// en passant
// promotion

// check
// player cannot put himself into check
// checkmate
// it's a stalemate if player is not in check but cannot move
