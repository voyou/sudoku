/*
Copyright (C) 2015 Voyou Désoeuvré

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

var arrayEqual = require('./array-equal');

/** 
 * An exception that is thrown if you attempt to set a value in a sudoku 
 * {@link Board} that is inconsistent with the already set values.
 *
 * @class
 */
function InconsistentSet(x, y, val, message) {
  this.message = "Attempt to set inconsistent board: <"+x+","+y+","+val+">: "+message;
}

exports.InconsistentSet = InconsistentSet;

/**
 * Represents a sudoku board. Provides methods to set values in the board.
 * Also provides static functions to create boards in various ways, which
 * you probably want to use instead of this constructor.
 * 
 * @class
 * @param {Number} size The size of one side of the grid.
 * @param {Array} cells A one-dimensional array of length size * size in which
 *                      the current state of the board will be stored.
 */
function Board(size, cells) {
  this.size = size;
  this.cells = cells;
  this.regionSize = Math.sqrt(this.size);
}

/**
 * Create an empty board of the given size.
 *
 * @param {Number} size The size of one side of the board.
 * @returns {Board}
 */
Board.empty = function(size) {
  var possibles = [];
  for( var i = 0; i < size; i++ )
    possibles[i] = i + 1;
  var cells = [];
  for( var y = 0; y < size; y++ ) {
    for( var x = 0; x < size; x++ ) {
      cells[y * size + x] = possibles.slice();
    } 
  }
  return new Board(size, cells);
};

/**
 * Create a board corresponding to a string representation.
 *
 * The string contains elements, separated by spaces, representing the value to go 
 * in each cell (row by row), where a number represents a known value, and a 
 * non-numeric string represents an unknown value.
 *
 * @param {number} size The size of the side of the grid.
 * @param {string} string The string representation of the board.
 * @returns {Board}
 */
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
};

/**
 * Create a board corresponding to a two-dimensional array.
 *
 * Each element of the array is an array representing a row, and each element
 * of *that* array is a number, where 0 represents an unknown.
 *
 * @param {Array}
 * @returns {Board}
 */
Board.parseGrid = function(grid) {
  var size = grid.length;
  var board = Board.empty(size);
  for( var y = 0; y < size; y++ )
    for( var x = 0; x < size; x++ ) {
      var n = grid[y][x];
      if( n !== 0 )
        board.set(x, y, n);
    }
  return board;
};

/**
 * Return a random integer between two values.
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generate a set of clues for a board with a unique solution.
 *
 * The algorithm used to generate boards is fast and simple, and comes up with
 * easy boards. It picks an empty cell, fills it with one of its possible values,
 * removes that value from the cells in the corresponding row, column, and region
 * and then checks to see whether that gives us a board with a complete solution.
 *
 * @param {number} size The size of the side of the board.
 * @param {boolean} [symmetrical=false] If this is set to true, the generator
 *  tries (although not very hard) to produce a grid with 180 degree 
 *  rotational symmetry.
 * @returns {object} An object with two keys. 'clues' is an array of [x, y, value]
 *  triples giving the values to set as initial clues, and 'solution' is a two
 *  dimensional array giving the values in the complete grid corresponding to
 *  those clues.
 */
Board.generate = function(size, symmetrical) {
  if( symmetrical === undefined )
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
  return { clues: additions, solution: board.toGrid() };
};

/**
 * Pads a string with spaces at the end.
 * 
 * @param {string} s The string to pad.
 * @param {number} l The minimum length of the resulting string.
 * @returns {string}
 */
function pad(s, l) {
  s = s.toString();
  var ret = [s];
  for( var i = 0; i < l - s.length; i++  )
    ret.push(' ');
  return ret.join('');
}

Board.prototype = {
  /**
   * Two Boards are equal if they have exactly the same values (known and 
   * potential) for each cell.
   *
   * @param {Board} other
   * @return {boolean}
   */
  equals: function(other) {
    return arrayEqual(this.cells, other.cells);
  },
  
  /**
   * Remove a value from the list of possible values for a cell.
   *
   * If this leaves the cell with only one remaining possible value, the cell
   * will be set to that value, and that value removed from all the other cells
   * in the row, column and region.
   *
   * If the given cell is already set to that value, throw an InconsistentSet
   * exception.
   * @param {number} x x co-ordinate
   * @param {number} y y co-ordinate
   * @param {number} val value to remove
   */
  remove: function(x, y, val) {
    var current = this.cells[y * this.size + x];
    if( Array.isArray(current) ) {
      var i = current.indexOf(val);
      if( i >= 0 )
        current.splice(i, 1);
      if( current.length == 1 )
        this.set(x, y, current[0]);
    }    
    else if( current == val )
      throw new InconsistentSet(x, y, val, "Inconsistent cascade");
  },
  
  /**
   * Set a cell to a specific value, and remove that value from every other
   * cell in the row, column, and region.
   *
   * If that cell already has a value set, and InconsistentSet exception is 
   * thrown. If setting this value would lead to inconsistencies with other
   * cells already set, and InconsistenSet exception is thrown.
   *
   * @param {number} x x coordinate
   * @param {number} y y coordinate
   * @param {number} val value to set
   */ 
  set: function(x, y, val) {
    var current = this.cells[y * this.size + x];
    var rx, ry;
    
    if( !Array.isArray(current) )  {
      if( current != val )
        throw new InconsistentSet(x, y, val, "Already set");
    }
    else if( current.indexOf(val) == -1 )
      throw new InconsistentSet(x, y, val, "Ruled out value");
    this.cells[y * this.size + x] = val;
    // Update other cells in row
    for( rx = 0; rx < this.size; rx++ )
      if( rx != x )
        this.remove(rx, y, val);
    // Update other cells in col
    for( ry = 0; ry < this.size; ry++ )
      if( ry != y )
        this.remove(x, ry, val);
    // Update other cells in region
    var regionXOff = Math.floor(x / this.regionSize) * this.regionSize;
    var regionYOff = Math.floor(y / this.regionSize) * this.regionSize;
    for( ry = 0; ry < this.regionSize; ry++ )
      for( rx = 0; rx < this.regionSize; rx++ )
        if( regionXOff + rx != x || regionYOff + ry != y )
          this.remove(regionXOff + rx, regionYOff + ry, val);
  },
  
  /**
   * Returns true if the value of every cell in the board is known.
   *
   * @returns {string}
   */
  isSolved: function() {
    return !this.cells.some(Array.isArray);
  },
  
  /**
   * Converts a Board to a two-dimensional array of numbers, containing
   * the value of each cell, or 0 if unknown, organised by rows.
   *
   * @returns {number[][]}
   */
  toGrid: function() {
    var ret = [];
    for( var r = 0; r < this.size; r++ ) {
      var row = [];
      for( var c = 0; c < this.size; c++ ) {
        var cell = this.cells[r * this.size + c];
        if( Array.isArray(cell) )
          row[c] = 0;
        else
          row[c] = cell;
      }
      ret[r] = row;
    }
    return ret;
  },
  /* Returns a string representation of the current state of the Board
   *
   * @returns {string}
   */
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
};


exports.Board = Board;
