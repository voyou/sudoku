"use strict";
require('./array');
var _ = require('lodash');

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
    for( var x = 0; x < size; x++ ) {
      cells[y * size + x] = possibles.deepCopy();
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
          board.set(x, y, n);
      }
    }
  return board;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

Board.generate = function(size, symmetrical) {
  if( symmetrical == undefined )
    symmetrical = false;
  var board = Board.empty(size);
  var additions = [];
  do {
    var row = randomInt(0, size);
    var col = randomInt(0, size);
    var cell = board.cells[row * size + col];

    var corow = size - row;
    var cocol = size - col;
    var cocell = board.cells[corow * size + cocol];
    
    if( !Array.isArray(cell) )
      continue;
    try {
      var i = randomInt(0, cell.length);
      board.set(col, row, cell[i]);
      additions.push([col, row, cell[i]]);
      if( symmetrical && Array.isArray(cocell) ) {
        var coi = randomInt(0, cocell.length);
        board.set(cocol, corow, cocell[coi]);
        additions.push([cocol, corow, cocell[coi]]);
      }
    } catch( e ) {
      if( e instanceof InconsistentSet ) {
        board = Board.empty(size);
        additions = [];
      } else
        throw e;
    }
  } while( ! board.isSolved() );
  return additions;
}

Board.printJust = function(size, set) {
  var rows = []
  for( var row = 0; row < size; row++ ) {
    rows[row] = [];
    for( var col = 0; col < size; col++ )
      rows[row][col] = 0;
  }

  for( var i = 0; i < set.length; i++ ) {
    var cell = set[i];
    rows[cell[1]][cell[0]] = cell[2];
  }
  
  var lines = []
  for( var row = 0; row < size; row++ ) {
    var line = [];
    for( var col = 0; col < size; col++ ) 
      if( rows[row][col] == 0 )
        line.push('.');
      else
        line.push(rows[row][col]);
    lines.push(line.join(' '))
  }
  return lines.join('\n');
}

function pad(s, l) {
  s = s.toString();
  var ret = [s];
  for( var i = 0; i < l - s.length; i++  )
    ret.push(' ');
  return ret.join('');
}

Board.prototype = {
  equals: function(other) {
    return this.cells.equals(other.cells);
  },
  remove: function(x, y, val, sx, sy, sval) {
    var current = this.cells[y * this.size + x];
    if( Array.isArray(current) ) {
      current.remove(val);
      if( current.length == 1 )
        this.set(x, y, current[0]);
    }    
    else if( current == val )
      throw new InconsistentSet(sx, sy, sval, "Inconsistent cascade <"+x+','+y+','+val+'>');
  },
  set: function(x, y, val) {
    var current = this.cells[y * this.size + x];

    if( !Array.isArray(current) )  {
      if( current != val )
        throw new InconsistentSet(x, y, val, "Already set");
    }
    else if( current.indexOf(val) == -1 )
      throw new InconsistentSet(x, y, val, "Ruled out value");
    this.cells[y * this.size + x] = val;
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
  isSolved: function() {
    return ! _.some(this.cells, Array.isArray)
  },
  prettyPrint: function() {
    var ret = [];
    for(var row = 0; row < this.size; row++ ) {
      var line = [];
      for( var col = 0; col < this.size; col++ ) {
        var cell = this.cells[row * this.size + col];
        if( Array.isArray(cell) )
          line.push(pad('['+cell.join('')+']', this.size+2));      
        else
          line.push(pad(cell, this.size+2));
      }
      ret.push(line.join(' '));
      ret.push('\n');
    }
    return ret.join('');   
  } 
}


exports.Board = Board;
