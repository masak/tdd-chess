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

var domUpdate = function(gameState) {
    var player = gameState.playerOnTurn;
    var playerCapitalized = player.substring(0, 1).toUpperCase() + player.substring(1);
    var symbol = (player === Color.WHITE ? Piece.WHITE_KING : Piece.BLACK_KING).symbol();
    $('#status').html(playerCapitalized + " " + symbol + " to move");

    $('#board tr').each(function(i, row) {
        $(row).find('td').each(function(j, cell) {
            $(cell).html( gameState.board[i][j].symbol() );
        });
    });
};

var initializePlacementLogic = function() {
    var selectedSquare;

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
            var fromPos = posFromSquare($('#board'), selectedSquare);
            var toPos = posFromSquare($('#board'), event.target);
            var move = new Move(gameState, fromPos, toPos);
            if (move.isLegal()) {
                move.make();
                domUpdate(gameState);
            }
            else {
                $('#board').addClass('illegal-move');
                setTimeout(function() {
                    $('#board').removeClass('illegal-move');
                }, 2000);
            }

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
        }
    });
};
