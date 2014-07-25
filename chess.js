'use strict';

var Color = {
    WHITE: "white"
};

var Type = {
    ROOK: {
        name: "rook",
        jumpIsLegal: function(move) {
            return move.isHorizontal() || move.isVertical();
        }
    },
    KNIGHT: {
        name: "knight",
        jumpIsLegal: function(move) {
            return move.isKnightMove();
        }
    },
    BISHOP: {
        name: "bishop",
        jumpIsLegal: function(move) {
            return move.isDiagonal();
        }
    }
};

var Piece = function(color, type) {
    this.color = color;
    this.type = type;

    this.name = color + " " + type.name;
};

Piece.prototype.jumpIsLegal = function(fromPos, toPos) {
    return this.type.jumpIsLegal(fromPos, toPos);
};

Piece.WHITE_ROOK = new Piece(Color.WHITE, Type.ROOK);
Piece.WHITE_KNIGHT = new Piece(Color.WHITE, Type.KNIGHT);
Piece.WHITE_BISHOP = new Piece(Color.WHITE, Type.BISHOP);

var Move = function(board, fromPos, toPos) {
    this.fromPos = fromPos;
    this.toPos = toPos;
    this.piece = board[ fromPos[0] ][ fromPos[1] ];
};

Move.prototype = {
    isLegal: function() {
        return this.piece.jumpIsLegal(this);
    },

    rankDist: function() {
        return Math.abs(this.fromPos[0] - this.toPos[0]);
    },

    fileDist: function() {
        return Math.abs(this.fromPos[1] - this.toPos[1]);
    },

    isHorizontal: function() {
        return this.rankDist() === 0;
    },

    isVertical: function() {
        return this.fileDist() === 0;
    },

    isKnightMove: function() {
        return this.rankDist() === 1 && this.fileDist() === 2 ||
               this.rankDist() === 2 && this.fileDist() === 1;
    },

    isDiagonal: function() {
        return this.rankDist() === this.fileDist();
    }
};

var board = (function () {
    var piece = function(i, j) {
        return '&#' + (9812 + 6 * i + j) + ';';
    };

    var board = [];
    for (var i = 0; i < 8; i++) {
        var row = [];
        for (var j = 0; j < 8; j++) {
            row.push("");
        }
        board.push(row);
    }

    board.empty = function() {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                board[i][j] = "";
            }
        }
    };

    board.chess = function() {
        board.empty();

        var WHITE_KING = piece(0, 0),
            WHITE_QUEEN = piece(0, 1),
            WHITE_ROOK = piece(0, 2),
            WHITE_BISHOP = piece(0, 3),
            WHITE_KNIGHT = piece(0, 4),
            WHITE_PAWN = piece(0, 5),
            BLACK_KING = piece(1, 0),
            BLACK_QUEEN = piece(1, 1),
            BLACK_ROOK = piece(1, 2),
            BLACK_BISHOP = piece(1, 3),
            BLACK_KNIGHT = piece(1, 4),
            BLACK_PAWN = piece(1, 5);

        var pieces = [
            [WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT, WHITE_ROOK],
            [WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN],
            [BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN],
            [BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT, BLACK_ROOK]
        ];

        var rows = [0, 1, 6, 7];
        for (var i in rows) {
            var r = rows[i];
            board[r] = pieces[i];
        }
    };

    return board;
})();
