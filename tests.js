'use strict';

var testBoard = board.clone();

var checkMoves = function(assert, conf) {
    testBoard.empty();
    var pos = conf.initPos,
        i = pos[0],
        j = pos[1],
        piece = conf.piece;
    testBoard[i][j] = conf.piece;

    for (var i in conf.legal) {
        var newPos = conf.legal[i];
        var move = new Move(testBoard, pos, newPos);
        assert.ok(move.isLegal(), "Legal: moving a " + piece.name + " from " + pos + " to " + newPos);
    }

    for (var i in conf.illegal) {
        var newPos = conf.illegal[i];
        var move = new Move(testBoard, pos, newPos);
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

    checkMoves(assert, {
        piece: Piece.BLACK_PAWN,
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
});

// whose turn it is

// pieces cannot take their own
// but they can take opponent pieces
// pawn capture

// pieces cannot go through things
// ...but the knight can

// castling

// pawn double step
// en passant
// promotion

// check
// player cannot put himself into check
// checkmate
// it's a stalemate if player is not in check but cannot move
