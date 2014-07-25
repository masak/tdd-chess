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
        for (var j = 0; j < 6; j++) {
            var symbol = '&#' + (9812 + 6 * i + j) + ';';
            var square = $('<td></td>').html(symbol);
            row.append(square);
        }
        pieces.append(row);
    }
};

var domUpdate = function(board) {
    $('#board tr').each(function(i, row) {
        $(row).find('td').each(function(j, cell) {
            $(cell).html( board[i][j] );
        });
    });
};

var initializeSelectionLogic = function() {
    var selectedSquare;
    $('#pieces').on('click', 'td', function(event) {
        $(selectedSquare).removeClass('selected');
        selectedSquare = event.target;
        $(selectedSquare).addClass('selected');
    });

    var posFromSquare = function(sought) {
        var pos = {};
        $('#board tr').each(function(i, row) {
            $(row).find('td').each(function(j, cell) {
                if (sought === cell) {
                    pos.i = i;
                    pos.j = j;
                }
            });
        });
        return pos;
    };

    $('#board').on('click', 'td', function(event) {
        if (selectedSquare) {
            var pos = posFromSquare(event.target);
            board[pos.i][pos.j] = $(selectedSquare).html();
            domUpdate(board);
            $(selectedSquare).removeClass('selected');
            selectedSquare = undefined;
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
