var S = require('../sudoku.js');

exports.empty  = function(test) {
  var board = S.Board.empty(4);
  var p = [1, 2, 3, 4];
  var boardl = new S.Board(4, [
    p, p, p, p,
    p, p, p, p,
    p, p, p, p,
    p, p, p, p
  ]);
  test.ok(board.equals(boardl));
  test.done();
}

exports.inconsistentSetThrows = function(test) {
  var board = S.Board.empty(4);
  board.set(0, 0, 1);
  var threw = false;
  try {
    board.set(0, 1, 1);
  } catch( e ) {
    if( e instanceof S.InconsistentSet )
      threw = true;
    else  
      throw e;
  }
  test.ok(threw);
  test.done();
}

exports.parseFull = function(test) {
  var boardp = S.Board.parse(4,
    "1 2 3 4 " +
    "3 4 1 2 " +
    "4 3 2 1 " +
    "2 1 4 3");
  var boardl = new S.Board(4, [
    1, 2, 3, 4,
    3, 4, 1, 2,
    4, 3, 2, 1,
    2, 1, 4, 3
  ]);
  test.ok(boardp.equals(boardl));
  test.done();
}

exports.solveEmpty = function(test) {
  S.Board.empty(9).solve(1);
  test.done();
}

exports.solve = function(test) {
	var board = S.Board.parse(9,
    "1 2 3 4 5 . . . . " + 
    "4 5 6 7 8 . . . 3 " +
    "7 8 9 1 2 . . . . " + 
    "2 3 4 5 6 7 . . . " +
    "5 6 7 8 9 1 2 3 4 " + 
    "8 9 1 2 3 4 5 6 7 " +
    "3 4 5 6 7 8 9 1 2 " +
    "6 7 8 9 1 2 3 4 5 " +
    "9 1 2 3 4 5 6 7 8"
	);
	var solution = S.Board.parse(9,
    "1 2 3 4 5 6 7 8 9 " + 
    "4 5 6 7 8 9 1 2 3 " +
    "7 8 9 1 2 3 4 5 6 " + 
    "2 3 4 5 6 7 8 9 1 " +
    "5 6 7 8 9 1 2 3 4 " + 
    "8 9 1 2 3 4 5 6 7 " +
    "3 4 5 6 7 8 9 1 2 " +
    "6 7 8 9 1 2 3 4 5 " +
    "9 1 2 3 4 5 6 7 8"
	);
	var solutions = board.solve();
	test.ok(solutions[0].equals(solution));
	test.done();

}

exports.generate = function(test) {
  var additions = S.Board.generate(4);
  var board = S.Board.empty(4);
  for( var i = 0; i < additions.length; i++ ) {
    var a = additions[i];
    board.set(a[0], a[1], a[2]);
  }
  var s = board.solve();
  console.log(s[0].prettyPrint());
  test.equal(board.solve().length, 1);
  test.done();
}
