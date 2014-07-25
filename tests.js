'use strict';

var checkMoves = function(assert, conf) {
    board.empty();
    var pos = conf.initPos,
        i = pos[0],
        j = pos[1],
        piece = conf.piece;
    board[i][j] = conf.piece;

    for (var i in conf.legal) {
        var newPos = conf.legal[i];
        var move = new Move(board, pos, newPos);
        assert.ok(move.isLegal(), "Legal: moving a " + piece.name + " from " + pos + " to " + newPos);
    }

    for (var i in conf.illegal) {
        var newPos = conf.illegal[i];
        var move = new Move(board, pos, newPos);
        assert.ok(!move.isLegal(), "Illegal: moving a " + piece.name + " from " + pos + " to " + newPos);
    }

    board.empty();
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
