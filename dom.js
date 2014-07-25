'use strict';

var initializeBoard = function() {
    var board = $('#board');
    for (var rank = 0; rank < 8; rank++) {
        var row = $('<tr></tr>');
        for (var file = 0; file < 8; file++) {
            var color = (rank + file) % 2 ? 'dark' : 'light';
            var square = $('<td></td>').addClass(color);
            row.append(square);
        }
        board.append(row);
    }
};

var initializePieces = function() {
    var pieces = $('#pieces');
    var colors = ['white', 'black'];
    for (var i in colors) {
        var color = colors[i];
        var row = $('<tr></tr>');
        var p = initializePieces.pieces;
        for (var j = 0; j < 6; j++) {
            var square = $('<td></td>').html(p[i][j].symbol());
            row.append(square);
        }
        pieces.append(row);
    }
};
initializePieces.pieces = [
    [Piece.WHITE_KING, Piece.WHITE_QUEEN, Piece.WHITE_ROOK, Piece.WHITE_BISHOP, Piece.WHITE_KNIGHT, Piece.WHITE_PAWN],
    [Piece.BLACK_KING, Piece.BLACK_QUEEN, Piece.BLACK_ROOK, Piece.BLACK_BISHOP, Piece.BLACK_KNIGHT, Piece.BLACK_PAWN]
];

var domUpdate = function(board) {
    $('#board tr').each(function(i, row) {
        $(row).find('td').each(function(j, cell) {
            $(cell).html( board[i][j].symbol() );
        });
    });
};

var initializePlacementLogic = function() {
    var selectedSquare;
    var boardSquareSelected;

    $('#pieces').on('click', 'td', function(event) {
        $(selectedSquare).removeClass('selected');
        selectedSquare = event.target;
        $(selectedSquare).addClass('selected');
        boardSquareSelected = false;
    });

    var posFromSquare = function(table, sought) {
        var pos;
        table.find('tr').each(function(i, row) {
            $(row).find('td').each(function(j, cell) {
                if (sought === cell) {
                    pos = [i, j];
                }
            });
        });
        return pos;
    };

    $('#board').on('click', 'td', function(event) {
        if (selectedSquare) {
            if (event.target === selectedSquare) {
                return;
            }
            var toPos = posFromSquare($('#board'), event.target);
            if (boardSquareSelected) {
                var fromPos = posFromSquare($('#board'), selectedSquare);
                var move = new Move(board, fromPos, toPos);
                if (move.isLegal()) {
                    board.makeMove(move);
                }
                else {
                    $('#board').addClass('illegal-move');
                    setTimeout(function() {
                        $('#board').removeClass('illegal-move');
                    }, 2000);
                }
            }
            else {
                var fromPos = posFromSquare($('#pieces'), selectedSquare);
                board[toPos[0]][toPos[1]] = initializePieces.pieces[fromPos[0]][fromPos[1]];
            }

            domUpdate(board);
            $(selectedSquare).removeClass('selected');
            selectedSquare = undefined;
        }
        else {
            if ($(event.target).html() === "") {
                return;
            }
            $(selectedSquare).removeClass('selected');
            selectedSquare = event.target;
            $(selectedSquare).addClass('selected');
            boardSquareSelected = true;
        }
    });
};

var initializeActions = function() {
    var emptyBoard = function() {
        board.empty();
        domUpdate(board);
    };
    var chessBoard = function() {
        board.chess();
        domUpdate(board);
    };
    var actions = [
        { label: "Empty board", fn: emptyBoard },
        { label: "Initial board", fn: chessBoard }
    ];

    $('#actions').append('<tr></tr>');
    for (var i in actions) {
        var action = actions[i];
        var cell = $('<td></td>')
            .html(action.label)
            .on('click', action.fn);
        $('#actions tr').append(cell);
    }
};
