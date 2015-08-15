/*global createState, $, createMove, rules, pieces */

var init;

(function domIIFE() {
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

    var promotionTypes = ['rook', 'knight', 'bishop', 'queen'];
    var $promotionMenus = $('#promotion-menu-white, #promotion-menu-black');

    var initializePromotionMenus = function initializePromotionMenus() {
        for (var i = 0; i < promotionTypes.length; i++) {
            var type = promotionTypes[i];
            var $piece = $('<span></span>').html(pieces.black[type].symbol);
            $promotionMenus.append($piece);
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
                $(cell).html(state.pieceAt([i, j]).symbol);
                $(cell).addClass(state.pieceAt([i, j]).color);
            });
        });
    };

    var initializePlacementLogic = function initializePlacementLogic() {
        var moveFromSquare;
        var moveToSquare;

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
            if (moveFromSquare && !friendlyPiece) {
                if (event.target === moveFromSquare) {
                    return;
                }
                var fromPos = posFromSquare($('#board'), moveFromSquare);
                var toPos = pos;
                var move = createMove(fromPos, toPos);
                if (rules.isPromotion(move, state)) {
                    var color = state.pieceAt(fromPos).color,
                        menu = $('#promotion-menu-' + color),
                        left = event.pageX - parseInt(menu.css('width')) / 2,
                        top = event.pageY - parseInt(menu.css('height')) / 2;

                    menu.css('left', left).css('top', top).show();

                    moveToSquare = event.target;
                    return;
                }
                if (rules.isLegal(move, state)) {
                    state.makeMove(move);
                    domUpdate();
                } else {
                    $promotionMenus.hide();
                    $('#board').addClass('illegal-move');
                    setTimeout(function () {
                        $('#board').removeClass('illegal-move');
                    }, 2000);
                }

                $(moveFromSquare).removeClass('selected');
                moveFromSquare = undefined;
            } else if (friendlyPiece) {
                $promotionMenus.hide();
                $(moveFromSquare).removeClass('selected');
                moveFromSquare = event.target;
                $(moveFromSquare).addClass('selected');
            }
        });

        $promotionMenus.on('click', 'span', function(event) {
            var n = $(this).prevAll().length;
            var type = promotionTypes[n];

            var fromPos = posFromSquare($('#board'), moveFromSquare);
            var toPos = posFromSquare($('#board'), moveToSquare);
            var move = createMove(fromPos, toPos, type);

            state.makeMove(move);
            $promotionMenus.hide();
            $(moveFromSquare).removeClass('selected');
            moveFromSquare = undefined;
            domUpdate();
        });
    };
    
    init = function init() {
        initializeBoard();
        initializePromotionMenus();
        initializePlacementLogic();
        domUpdate();
    };
}());
