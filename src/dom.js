/*global createState, $, createMove, rules */

var init;

(function () {
    'use strict';

    var state = createState('chess');

    var initializeBoard = function initializeBoard() {
        var board = $('#board'), rank, row, file, color, square;
        for (rank = 0; rank < 8; rank++) {
            row = $('<tr></tr>');
            for (file = 0; file < 8; file++) {
                color = (rank + file) % 2 ? 'dark' : 'light';
                square = $('<td></td>').addClass(color);
                row.append(square);
            }
            board.append(row);
        }
    };

    var domUpdate = function domUpdate() {
        var player = state.playerOnTurn,
            playerCapitalized = player.substring(0, 1).toUpperCase() +
                player.substring(1),
            symbol = player === 'white' ? '&#9812;' : '&#9818;';
        $('#status').html(playerCapitalized + " " + symbol + " to move");

        $('#board tr').each(function (i, row) {
            $(row).find('td').each(function (j, cell) {
                $(cell).removeClass("white black");
                $(cell).html(state.board[i][j].symbol);
                $(cell).addClass(state.board[i][j].color);
            });
        });
    };

    var initializePlacementLogic = function initializePlacementLogic() {
        var selectedSquare;

        var posFromSquare = function (table, sought) {
            var pos;
            table.find('tr').each(function (i, row) {
                $(row).find('td').each(function (j, cell) {
                    if (sought === cell) {
                        pos = [i, j];
                    }
                });
            });
            return pos;
        };

        $('#board').on('click', 'td', function (event) {
            var pos = posFromSquare($('#board'), event.target);
            var friendlyPiece = state.board[pos[0]][pos[1]].color ===
                state.playerOnTurn;
            if (selectedSquare && !friendlyPiece) {
                if (event.target === selectedSquare) {
                    return;
                }
                var fromPos = posFromSquare($('#board'), selectedSquare);
                var toPos = pos;
                var move = createMove(fromPos, toPos);
                if (rules.isLegal(move, state)) {
                    state.makeMove(move);
                    domUpdate();
                } else {
                    $('#board').addClass('illegal-move');
                    setTimeout(function () {
                        $('#board').removeClass('illegal-move');
                    }, 2000);
                }

                $(selectedSquare).removeClass('selected');
                selectedSquare = undefined;
            } else if (friendlyPiece) {
                $(selectedSquare).removeClass('selected');
                selectedSquare = event.target;
                $(selectedSquare).addClass('selected');
            }
        });
    };
    
    init = function init() {
        initializeBoard();
        initializePlacementLogic();
        domUpdate();
    };
}());