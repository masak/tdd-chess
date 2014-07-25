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

var initializeSelectionLogic = function() {
  var selectedSquare;
  $('#pieces').on('click', 'td', function(event) {
    $(selectedSquare).removeClass('selected');
    selectedSquare = event.target;
    $(selectedSquare).addClass('selected');
  });

  $('#board').on('click', 'td', function(event) {
    if (selectedSquare) {
      $(event.target).html( $(selectedSquare).html() );
      $(selectedSquare).removeClass('selected');
      selectedSquare = undefined;
    }
  });
};

var initializeActions = function() {
  var emptyBoard = function() {
    $('#board td').each(function(_, cell) {
        $(cell).html("");
    });
  };
  var chessBoard = function() {
    var piece = function(i, j) {
      return '&#' + (9812 + 6 * i + j) + ';';
    };
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
    emptyBoard();
    var pieces = [
      [WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT, WHITE_ROOK],
      [WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN],
      [BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN],
      [BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT, BLACK_ROOK]
    ];
    $('#board tr').eq(0).find('td').each(function(i, cell) { $(cell).html( pieces[0][i] ) });
    $('#board tr').eq(1).find('td').each(function(i, cell) { $(cell).html( pieces[1][i] ) });
    $('#board tr').eq(6).find('td').each(function(i, cell) { $(cell).html( pieces[2][i] ) });
    $('#board tr').eq(7).find('td').each(function(i, cell) { $(cell).html( pieces[3][i] ) });
  };
  var actions = [
    {
      label: "Empty board",
      fn: emptyBoard
    },
    {
      label: "Initial board",
      fn: chessBoard
    }
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
