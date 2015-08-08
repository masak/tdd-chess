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
        var move = createMove(pos, newPos);
        assert.ok(rules.isLegal(move, testState),
            "Legal: moving a " + piece.name +
            " from " + pos + " to " + newPos);
    }

    for (var i in conf.illegal) {
        var newPos = conf.illegal[i];
        var move = createMove(pos, newPos);
        assert.ok(!rules.isLegal(move, testState),
            "Illegal: moving a " + piece.name +
            " from " + pos + " to " + newPos);
    }
};

QUnit.test( "rook moves", function( assert ) {
    checkMoves(assert, {
        piece: WHITE_ROOK,
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
        piece: WHITE_KNIGHT,
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
        piece: WHITE_BISHOP,
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
        piece: WHITE_QUEEN,
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
        piece: WHITE_KING,
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

QUnit.test( "pawn moves", function( assert ) {
    checkMoves(assert, {
        piece: WHITE_PAWN,
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
        piece: BLACK_PAWN,
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

QUnit.test( "turn alternates between players", function( assert ) {
    testState.chess();

    var move = createMove([1, 4], [2, 4]);
    assert.ok(!rules.isLegal(move, testState), "black cannot start");

    testState.makeMove(createMove([6, 4], [5, 4]));
    move = createMove([1, 4], [2, 4]);
    assert.ok(rules.isLegal(move, testState), "black can move after white made a move");
});

QUnit.test( "pieces cannot take their own", function( assert ) {
    testState.reset();

    testState.board[3][3] = WHITE_QUEEN;
    testState.board[5][5] = WHITE_PAWN;
    testState.board[7][3] = BLACK_PAWN;

    var takeOwnPawn = createMove([3, 3], [5, 5]);
    assert.ok(!rules.isLegal(takeOwnPawn, testState), "can't take own piece");

    var takeOpponentPawn = createMove([3, 3], [7, 3]);
    assert.ok(rules.isLegal(takeOpponentPawn, testState), "can take opponent piece");
});

QUnit.test( "moving and capturing pawns", function( assert ) {
    testState.reset();

    testState.board[3][4] = WHITE_PAWN;
    testState.board[2][4] = BLACK_QUEEN;

    var forwardToCapture = createMove([3, 4], [2, 4]);
    assert.ok(!rules.isLegal(forwardToCapture, testState), "can't capture by moving forward");
    var diagonalToMove = createMove([3, 4], [2, 5]);
    assert.ok(!rules.isLegal(diagonalToMove, testState), "can't do a normal move diagonally");

    testState.board[2][4] = EMPTY;
    testState.board[2][5] = BLACK_QUEEN;

    var forwardToMove = createMove([3, 4], [2, 4]);
    assert.ok(rules.isLegal(forwardToMove, testState), "can do a normal move forward");
    var diagonalToCapture = createMove([3, 4], [2, 5]);
    assert.ok(rules.isLegal(diagonalToCapture, testState), "can capture by moving diagonally");
});

QUnit.test( "pieces cannot go through things", function( assert ) {
    testState.reset();

    testState.board[1][1] = WHITE_PAWN;
    testState.board[1][2] = WHITE_ROOK;
    testState.board[1][3] = WHITE_BISHOP;
    testState.board[1][4] = WHITE_QUEEN;

    testState.board[2][1] = BLACK_QUEEN;
    testState.board[6][2] = BLACK_QUEEN;
    testState.board[2][3] = BLACK_QUEEN;
    testState.board[3][5] = BLACK_QUEEN;
    testState.board[2][5] = BLACK_QUEEN;

    var pawnThroughPiece = createMove([1, 1], [3, 1]);
    assert.ok(!rules.isLegal(pawnThroughPiece, testState), "pawn can't go through a piece");

    var rookThroughPiece = createMove([1, 2], [7, 2]);
    assert.ok(!rules.isLegal(rookThroughPiece, testState), "rook can't go through a piece");

    var bishopThroughPiece = createMove([1, 3], [5, 7]);
    assert.ok(!rules.isLegal(bishopThroughPiece, testState), "bishop can't go through a piece");

    var queenThoughPiece = createMove([1, 4], [3, 2]);
    assert.ok(!rules.isLegal(queenThoughPiece, testState), "queen can't go though a piece");
});

QUnit.test( "the knight can go through things", function( assert ) {
    testState.reset();

    testState.board[1][1] = WHITE_KNIGHT;

    testState.board[2][1] = BLACK_PAWN;
    testState.board[1][2] = BLACK_KNIGHT;
    testState.board[2][2] = BLACK_BISHOP;
    testState.board[1][3] = BLACK_QUEEN;

    var knightOverPieces = createMove([1, 1], [2, 3]);
    assert.ok(rules.isLegal(knightOverPieces, testState), "knight can jump over pieces");
});

function initializeWithMoves(moves) {
    testState.chess();
    for (var i in moves) {
        var move = moves[i];
        var fromPos = move[0],
            toPos = move[1];
        testState.makeMove(createMove(fromPos, toPos));
    }
}

QUnit.test( "castling is legal", function( assert ) {
    initializeWithMoves([
        [[6, 4], [5, 4]],   // pawn opens for bishop
        [[1, 0], [2, 0]],
        [[7, 5], [6, 4]],   // bishop out of the way
        [[2, 0], [3, 0]],
        [[7, 6], [5, 5]],   // knight out of the way
        [[3, 0], [4, 0]]
    ]);

    var move = createMove([7, 4], [7, 6]);
    assert.ok(rules.isLegal(move, testState), "white king can castle here");
    testState.makeMove(move);
    assert.ok(testState.board[7][7] === EMPTY, "rook also moved...");
    assert.ok(testState.board[7][5] === WHITE_ROOK, "...to here");
});

QUnit.test( "castling is only legal if the rook is there", function( assert ) {
    initializeWithMoves([
        [[6, 4], [5, 4]],   // pawn opens for bishop
        [[1, 0], [2, 0]],
        [[7, 5], [6, 4]],   // bishop out of the way
        [[2, 0], [3, 0]],
        [[7, 6], [5, 5]],   // knight out of the way
        [[3, 0], [4, 0]],
        [[6, 7], [5, 7]],   // pawn opens for rook
        [[4, 0], [5, 0]],
        [[7, 7], [6, 7]],   // rook moves!
        [[1, 1], [2, 1]]
    ]);

    var move = createMove([7, 4], [7, 6]);
    assert.ok(!rules.isLegal(move, testState),
                "can not castle -- the rook is not in the right place");
});

QUnit.test( "castling is only legal if the king hasn't moved yet",
            function( assert ) {
    initializeWithMoves([
        [[6, 4], [5, 4]],   // pawn opens for bishop
        [[1, 0], [2, 0]],
        [[7, 5], [5, 3]],   // bishop out of the way
        [[2, 0], [3, 0]],
        [[7, 6], [5, 5]],   // knight out of the way
        [[3, 0], [4, 0]],
        [[7, 4], [6, 4]],   // king moves!
        [[4, 0], [5, 0]],
        [[6, 4], [7, 4]],   // king moves back, but it's already too late
        [[1, 1], [2, 1]]
    ]);

    var move = createMove([7, 4], [7, 6]);
    assert.ok(!rules.isLegal(move, testState), "king can not castle because it already moved");
});

QUnit.test( "castling is only legal if the chosen rook hasn't moved yet",
            function( assert ) {
    initializeWithMoves([
        [[6, 4], [5, 4]],   // pawn opens for bishop
        [[1, 0], [2, 0]],
        [[7, 5], [6, 4]],   // bishop out of the way
        [[2, 0], [3, 0]],
        [[7, 6], [5, 5]],   // knight out of the way
        [[3, 0], [4, 0]],
        [[7, 7], [7, 6]],   // rook moves!
        [[4, 0], [5, 0]],
        [[7, 6], [7, 7]],   // rook moves back, but it's already too late
        [[1, 1], [2, 1]]
    ]);

    var move = createMove([7, 4], [7, 6]);
    assert.ok(!rules.isLegal(move, testState),
                "white king can not castle because the rook already moved");
});

QUnit.test( "castling is only legal if there are no pieces " +
            "between king and rook", function( assert ) {
    initializeWithMoves([
        [[6, 4], [5, 4]],   // pawn opens for bishop
        [[1, 0], [2, 0]],
        [[7, 6], [5, 5]],   // knight out of the way
        [[2, 0], [3, 0]]
    ]);

    var move = createMove([7, 4], [7, 6]);
    assert.ok(!rules.isLegal(move, testState),
                "white king can not castle -- bishop is standing in the way");
});

QUnit.test( "castling is only legal if there are no pieces between king " +
            "and queen's rook", function( assert ) {
    initializeWithMoves([
        [[6, 3], [5, 3]],   // pawn opens for bishop
        [[1, 0], [2, 0]],
        [[7, 2], [6, 3]],   // bishop out of the way
        [[2, 0], [3, 0]],
        [[6, 4], [5, 4]],   // pawn opens for queen
        [[3, 0], [4, 0]],
        [[7, 3], [6, 4]],   // queen out of the way
        [[4, 0], [5, 0]]
    ]);

    var move = createMove([7, 4], [7, 2]);
    assert.ok(!rules.isLegal(move, testState),
                "white king can not castle -- queen's knight is in the way");
});

QUnit.test( "a pawn can advance two steps from its original rank",
            function( assert ) {
    testState.chess();

    var move = createMove([6, 4], [4, 4]);
    assert.ok(rules.isLegal(move, testState), "the pawn can advance two steps");

    testState.makeMove(createMove([6, 4], [5, 4]));
    move = createMove([5, 4], [3, 4]);
    assert.ok(!rules.isLegal(move, testState), "...but only from its original rank");
});

QUnit.test( "a pawn may not advance two steps and capture at the same time",
            function( assert ) {
    initializeWithMoves([
        [[6, 7], [4, 7]],
        [[1, 3], [3, 3]],
        [[4, 7], [3, 7]],
        [[3, 3], [4, 3]]
    ]);

    var move = createMove([6, 4], [4, 3]);
    assert.ok(!rules.isLegal(move, testState),
                "pawn cannot advance two steps and capture at the same time");
});

QUnit.test( "pawn en passant capture", function( assert ) {
    initializeWithMoves([
        [[6, 4], [4, 4]],
        [[1, 0], [3, 0]],
        [[4, 4], [3, 4]],   // white pawn now stands ready to en passant
        [[1, 3], [3, 3]],   // black pawn advanced two steps
    ]);

    var move = createMove([3, 4], [2, 3]);
    assert.ok(rules.isLegal(move, testState), "pawn can capture en passant");
    testState.makeMove(move);
    assert.ok(testState.board[3][3] === EMPTY, "...and it took the pawn");
});

QUnit.test( "can only en passant immediately afterwards", function( assert ) {
    initializeWithMoves([
        [[6, 4], [4, 4]],
        [[1, 0], [3, 0]],
        [[4, 4], [3, 4]],   // white pawn now stands ready to en passant
        [[1, 3], [3, 3]],   // black pawn advanced two steps (same as last test)
        [[6, 7], [5, 6]],
        [[3, 0], [4, 0]]    // two inconsequential moves
    ]);

    var move = createMove([3, 4], [2, 3]);
    assert.ok(!rules.isLegal(move, testState), "pawn missed its chance to capture en passant");
});

// promotion

// check
// player cannot put himself into check
// castling is only legal if the king is not currently in check
// castling is only legal if the king does not pass through a square that is attacked by an enemy piece
// checkmate
// it's a stalemate if player is not in check but cannot move
