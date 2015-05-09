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
/* global window */

"use strict";

var S = require('./sudoku');
var arrayEqual = require('./array-equal');

/**
 * GridView is responsible for creating the DOM elements that display the
 * sudoku grid, and updating them when the model notifies it of a change.
 *
 * @class
 * @param elem jQuery element to attach the sudoku view elements to.
 * @param {number} size The size of the side of the grid.
 * @param {function} [showValue] A function that takes a number and returns
      a string of HTML to use to represent that value. If left off, values
      will simply be converted to a string.
 */
function GridView(elem, size, showValue) {
  this.elem = elem;
  this.showValue = showValue;
  this.table = $('<table class="sudoku-grid"></table>');
  this.size = size;
  this.regionSize = Math.floor(Math.sqrt(size));
  
  var cellWidth = 100 / size;

  for( var r = 0; r < size; r++ ) {
    var row = $('<tr>');
    for( var c = 0; c < size; c++ ) {
      var cell = $('<td class="sudoku-cell"><a href="">&nbsp;</a></td>');
      var anchor = $('a', cell);
      
      cell.css('width', cellWidth + '%');
      if( r === (size - 1) )
        cell.addClass('sudoku-bottom');
      if( c === (size - 1) )
        cell.addClass('sudoku-right');
      if( c % this.regionSize === 0 )
        cell.addClass('sudoku-regionleft');
      if( r % this.regionSize === 0 )
        cell.addClass('sudoku-regiontop');
      
      anchor.addClass('sudoku-cell-' + c + '-' + r);
      
      anchor.data('coords', [c, r]);
      row.append(cell);
    }
    this.table.append(row);
  }
  this.elem.append(this.table);
  $(window).resize(this.onResize.bind(this));
  this.onResize();
}

GridView.prototype = {
  /**
   * Changes the value shown in a cell to the given value.
   *
   * @param {number} x x coordinate.
   * @param {number} y y coordinate.
   * @param {number} value The value to set this cell to.
   * @param {booelan} fixed Whether or not the user should be able to change
            this value.
   */
  updateCell: function(x, y, value, fixed) {
    var cell = $('.sudoku-cell-'+x+'-'+y, this.table);
    cell.html(this.showValue(value));
    if( fixed ) 
      cell.addClass('sudoku-cell-fixed');
  },
  
  /**
   * Clears the value shown in the cell.
   *
   * @param {number} x x coordinate.
   * @param {number} y y coordinate.
   */
  clearCell: function(x, y) {
    var cell = $('.sudoku-cell-'+x+'-'+y, this.table);
    cell.html('&nbsp;');
    cell.removeClass('sudoku-cell-fixed');    
  },
  
  /**
   * Creates a DOM element that can be used to select a value for a cell.
   *
   * @param cell The jQuery element of the cell in the grid that the selector
   *    will select its value for.
   */
  makeSelector: function(cell) {
    var size = this.size;
    var side = Math.floor(Math.sqrt(size));
    
    var result = $('<div class="sudoku-selector-container"></div>');
    
    if( cell.hasClass('sudoku-cell-fixed') ) {
      result.append($('<span class="glyphicon glyphicon-lock sudoku-fixed-icon" title="The value of an initial clue cannot be changed"></span><span class="sr-only">The value of an initial clue cannot be changed</span>'));
      return result;
    }
    
    
    var table = $('<table class="sudoku-selector"></table>');
    
    for( var r = 0; r < side; r++ ) {
      var row = $('<tr></tr>');
      for( var c = 0; c < side; c++ ) {
        var button = $('<td><button class="sudoku-selector-btn btn btn-default"></button></td>');
        var value = r * side + c + 1;
        $('button', button).html(this.showValue(value))
          .data('cell', cell)
          .data('value', value);
        row.append(button);
      }
      table.append(row);
    }
    result.append(table);
    
    var clear = $('<button class="sudoku-clear-btn btn btn-default">Clear</button>');
    clear.data('cell', cell);
    
    result.append(clear);
        
    return result;
  },
  
  /**
   * Resizes the grid so that it fits the width of its containing element.
   */
  onResize: function() {
    this.table.css('height', this.table.css('width'));
    var anchors = $('a', this.table);
    var anchorSize = anchors.width();
    addStyle('sudoku-font-sizes', ['.sudoku-selector', '.sudoku-cell a'], { 
      'font-size': (anchorSize / 2) + 'px' 
    });
    addStyle('sudoku-lock-size', ['.sudoku-fixed-icon'], {
      'font-size': (anchorSize * this.regionSize / 4) + 'px'
    });
  }

};

/**
 * GridModel is responsible for storing the data in the sudoku grid and 
 * updating the view when the data changes.
 *
 * @class
 * @param {number} size The size of the side of the grid.
 * @param {GridView} view The view this is the model for.
 */
function GridModel(size, view) {
  this.size = size;
  this.regionSize = Math.floor(Math.sqrt(size));
  this.cells = [];
  for( var r = 0; r < size; r++ ) {
    this.cells[r] = [];
    for( var c = 0; c < size; c++ )
      this.cells[r][c] = 0;
  }
  this.view = view;
}

GridModel.prototype = {
  /**
   * Set the value in the model, and update the view as appropriate. If this
   * causes the grid to be completely filled in, it rasises the 'sudoku:filled'
   * event on the containing element.
   *
   * @param {number} x x coordinate.
   * @param {number} y y coordinate.
   * @param {number} value The value to set.
   * @param {boolean} [fixed] Whether or not the user should be able to 
   *    change this value.
   */
  set: function(x, y, value, fixed) {
    if( typeof fixed === 'undefined' )
      fixed = false;
      
    this.cells[y][x] = value;
    
    if( this.isFilled() ) { 
      var solved = arrayEqual(this.cells, this.solution);
      this.view.elem.trigger('sudoku:filled', solved);
    }
      
    this.view.updateCell(x, y, value, fixed);    
  },
  
  /**
   * Clear the value at the given coordinate and raise the 'sudoku:not-filled'
   * event on the containing element.
   * 
   * @param {number} x x coordinate.
   * @param {number} y y coordinate.
   */
  clear: function(x, y) {
    this.cells[y][x] = 0;
    this.view.clearCell(x, y);
    this.view.elem.trigger('sudoku:not-filled');
  },
  
  /**
   * Call clear on every cell in the grid.
   */
  clearAll: function() {
    for(var y = 0; y < this.size; y++ )
      for( var x = 0; x < this.size; x++ )
        this.clear(x, y);
  },
  
  /**
   * Returns true if every cell in the grid is filled.
   */
  isFilled: function() {
    return this.cells.every( function(row) { 
      return row.every( function(c) { return c !== 0; } ); 
    });
  },
  
  /**
   * Clear the grid and then fill in the initial clues.
   */
  fillClues: function() {
    this.clearAll();
    this.clues.forEach(function (clue) {
      this.set(clue[0], clue[1], clue[2], true);
    }.bind(this));
  },
  
  /**
   * Generate a new set of clues and fill them in the grid.
   */
  generate: function() {
    var generated = S.Board.generate(this.size, true);
    this.solution = generated.solution;
    this.clues = generated.clues;
    this.fillClues();
  }
};


/**
 * The GridController is responsible for setting up events on the view that
 * update the model in response to user interaction.
 *
 * @class
 * @param {GridView} view The attached view, used to get the DOM elements.
 * @param {GridModel} model The attached model.
 */
function GridController(view, model) {
  this.view = view;
  this.model = model;
  
  var  makeSelector = this.view.makeSelector.bind(this.view);
  this.view.table.popover({
    content: function() { return makeSelector($(this)); },
    container: 'body',
    placement: 'auto top',
    selector: '.sudoku-cell a',
    trigger: 'focus',
    html: true
  });

  $('body').on('click', '.sudoku-selector-btn', this, this.onSelect);
  
  $('body').on('click', '.sudoku-clear-btn', this, this.onClear);

  this.view.table.on('click', '.sudoku-cell a', function (e) {
    e.preventDefault();
  });   
}

GridController.prototype = {
  onSelect: function (event) {
    var $this = $(this);
    var cell = $this.data('cell');
    var value = $this.data('value');
    
    var coords = cell.data('coords');
    
    event.data.model.set(coords[0], coords[1], value);
  },
  onClear: function(event) {
    var cell = $(this).data('cell');
    var coords = cell.data('coords');
    event.data.model.clear(coords[0], coords[1]);
  }
};


/**
 * Adds a style to the document.
 *
 * @param {string} id The id of the style element. If an element with this id
 *    already exists, it is replaced, otherwise a new element with this id is
 *    created.
 * @param {string[]} selectors The selectors to use in the created rule.
 * @param {Object.<string, string>} properties The properties to specify in the
 *     style rule.
 */
function addStyle(id, selectors, properties) {
  var selectorString = selectors.join(', ');
  var propStrings = [];
  for( var prop in properties ) {
    propStrings.push(prop + ':' + properties[prop]);
  }
  
  var text = selectorString + ' { ' + propStrings.join(';') + ' }';
  
  var elem = $('#'+id);
  if( elem.length === 0 ) {
    elem = $('<style type="text/css"></style>');
    elem.prop('id', id);
    elem.appendTo('head');
  } 
  elem.text(text);
}


/**
 * A local instantiation of the jQuery $ variable.
 */
var $;

/**
 * Initializes the sudoku jQuery plugin.
 */
exports.init = function(jQuery) {
  $ = jQuery;
  
  /**
   * Initialize or modify the sudoku plugin on an element.
   *
   * @param {string|number} command 'regenerate' to generate a new puzzle,
   *    'reset' to reset the puzzle to the existing clues, or a number to
   *    initialize the puzzle with a grid of the specified size.
   * @param {function} showValue A function to pass as the showValue parameter
   *    of the model.
   */
  $.fn.sudoku = function(command, showValue) {
  
    if( command === 'regenerate' ) {
      this.data('sudoku-model').generate();
      return;
    }
    
    if( command === 'reset' ) {
      this.data('sudoku-model').fillClues();
      return;
    }
    
    var size = command;
  
    if( typeof showValue == 'undefined' ) 
      showValue =  function (i) { return i; };
    
    var view = new GridView(this, size, showValue);
    var model = new GridModel(size, view);
    var controller = new GridController(view, model);

    model.generate();
    
    this.data('sudoku-model', model);

    return this;
  };
};
