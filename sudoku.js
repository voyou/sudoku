"use strict";
require('./array');

function InconsistentSet(x, y, val, message) {
  this.message = "Attempt to set inconsistent board: <"+x+","+y+","+val+">: "+message;
}

exports.InconsistentSet = InconsistentSet;

function MaxSolutionsReached() { }

function Board(size, cells) {
  this.size = size;
  this.cells = cells;
  this.regionSize = Math.sqrt(this.size);
}

Board.empty = function(size) {
  var possibles = []
  for( var i = 0; i < size; i++ )
    possibles[i] = i + 1;
  var cells = [];
  for( var y = 0; y < size; y++ ) {
    cells[y] = [];
    for( var x = 0; x < size; x++ ) {
      cells[y][x] = possibles.deepCopy();
    } 
  }
  return new Board(size, cells);
}

Board.parse = function(size, string) {
  var board = Board.empty(size);
  var elems = string.split(' ');
  for( var y = 0; y < size; y++ ) 
    for( var x = 0; x < size; x++ ) {
      // This returns the number at the relevant position in the string
      // or NaN, if the character there isn't a number.
      var n = Number(elems[y * size + x]);
      // NaN's are identified by the fact that they don't compare
      // equal to themselves.
      if( n == n ) {
        try {
          board.set(x, y, n);
        } catch( e ) {
          if( e instanceof InconsistentSet ) {
            console.log(board.prettyPrint());
            console.log(e.message);
          }
        }
      }
    }
  return board;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

Board.generate = function(size, minClues) {
  if( typeof minClues === 'undefined' )
    minClues = size;
  var board = Board.empty(size);
  var additions = [];
  var solutions = [];
  do {
    var row = randomInt(0, size);
    var col = randomInt(0, size);
    var cell = board.cells[row][col];
    if( !Array.isArray(cell) )
      continue;
    var i = randomInt(0, cell.length);
    var next = new Board(board.size, board.cells.deepCopy());
    try {
      next.set(col, row, cell[i]);
      additions.push([col, row, cell[i]]);
    } catch( e ) {
      if( e instanceof InconsistentSet ) {
        next = board;
      }
    }
    board = next;
    if( additions.length < minClues )
      continue;
    solutions = board.solve(2);
    if( solutions.length == 0 ) {
      additions = [];
      board = Board.empty(size);
    }
  } while( solutions.length != 1 );
  return additions;
}

Board.prototype = {
  equals: function(other) {
    return this.cells.equals(other.cells);
  },
  remove: function(x, y, val, sx, sy, sval) {
    var current = this.cells[y][x];
    //console.log("Remove "+val+" from "+x+","+y+"="+current);
    if( Array.isArray(current) ) {
      current.remove(val);
      if( current.length == 1 )
        this.set(x, y, current[0]);
    }    
    else if( current == val )
      throw new InconsistentSet(sx, sy, sval, "Iconsistent cascade <"+x+','+y+','+val+'>');
  },
  set: function(x, y, val) {
    var current = this.cells[y][x];

    if( !Array.isArray(current) )  {
      if( current != val )
        throw new InconsistentSet(x, y, val, "Already set");
    }
    else if( current.indexOf(val) == -1 )
      throw new InconsistentSet(x, y, val, "Ruled out value");
    this.cells[y][x] = val;
    // Update other cells in row
    for( var rx = 0; rx < this.size; rx++ )
      if( rx != x )
        this.remove(rx, y, val, x, y, val);
    // Update other cells in col
    for( var ry = 0; ry < this.size; ry++ )
      if( ry != y )
        this.remove(x, ry, val, x, y, val);
    // Update other cells in region
    var regionXOff = Math.floor(x / this.regionSize) * this.regionSize;
    var regionYOff = Math.floor(y / this.regionSize) * this.regionSize;
    for( var ry = 0; ry < this.regionSize; ry++ )
      for( var rx = 0; rx < this.regionSize; rx++ )
        if( regionXOff + rx != x || regionYOff + ry != y )
          this.remove(regionXOff + rx, regionYOff + ry, val, x, y, val);
  },
  _solve: function(solutions, maxSolutions) {
    //console.log(this.prettyPrint());
    var cell = null;
    top:
    for( var row = 0; row < this.size; row++ )
      for( var col = 0; col < this.size; col++ )
        if( Array.isArray(this.cells[row][col]) ) {
          cell = this.cells[row][col]; 
          break top;
        }
    if( cell === null ) {
      solutions.push(this);
      if( maxSolutions != 0 && solutions.length >= maxSolutions )
        throw new MaxSolutionsReached();
      return;
    }
    for(var i = 0; i < cell.length; i++ ) {
      var attempt = new Board(this.size, this.cells.deepCopy());
      try {
        attempt.set(col, row, cell[i]);
      } catch( e ) {
        if( e instanceof InconsistentSet )
          continue;
      }
      attempt._solve(solutions, maxSolutions);
    }
    return solutions;
  },
  solve: function(maxSolutions) {
    if( typeof maxSolutions === 'undefined' )
      maxSolutions = 0;
    var solutions = [];
    try {
      this._solve(solutions, maxSolutions);
    } catch( e ) {
      if( ! e instanceof MaxSolutionsReached )
        throw e;
    }
    return solutions;
  },
  prettyPrint: function() {
    var ret = [];
    for(var row = 0; row < this.size; row++ ) {
      var line = [];
      for( var col = 0; col < this.size; col++ ) {
        var cell = this.cells[row][col];
        if( Array.isArray(cell) )
          line.push('['+cell.join('')+']');      
        else
          line.push(cell);
      }
      ret.push(line.join(' '));
      ret.push('\n');
    }
    return ret.join('');   
  } 
}


exports.Board = Board;
