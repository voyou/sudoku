"use strict";

var S = require('./sudoku');

function GridModel(size, cells, elem, showValue) {
  this.size = size;
  this.regionSize = Math.floor(Math.sqrt(size));
  this.cells = cells;
  this.elem = elem;
}

GridModel.prototype = {
  set: function(x, y, value) {
    this.cells[y][x] = value;
    
    if( this.isFilled() ) { 
      var solved = false;
      try {
        var board = S.Board.parseGrid(this.cells);
        if( board.isSolved() )
          solved = true;
      } catch( e ) {
        if( ! (e instanceof S.InconsistentSet) )
          throw e;
      }
      this.elem.parent().trigger('sudoku:filled', solved);
    }
      
    this.elem.updateCell(x, y, value);    
  },
  clear: function(x, y) {
    this.cells[y][x] = 0;
    this.elem.clearCell(x, y);
  },
  isFilled: function() {
    return this.cells.every( function(row) { 
      return row.every( function(c) { return c != 0; }) 
    });
  }
}

exports.init = function($) {
  $.fn.sudoku = function(size, showValue) {
  
    if( typeof showValue == 'undefined' ) 
      showValue =  function (i) { return i; }
  
    var cells = [];
  
    var cellWidth = 100 / size;
    
    var table = $('<table class="sudoku-grid"></table>');
    var board = new GridModel(size, cells, table);
    
    for( var r = 0; r < size; r++ ) {
      var row = $('<tr>');
      cells[r] = [];
      for( var c = 0; c < size; c++ ) {
        var cell = $('<td class="sudoku-cell"><a href="">&nbsp;</a></td>')
        var anchor = $('a', cell);
        
        cell.css('width', cellWidth + '%');
        if( r == (size - 1) )
          cell.addClass('sudoku-bottom');
        if( c == (size - 1) )
          cell.addClass('sudoku-right');
        if( c % board.regionSize == 0 )
          cell.addClass('sudoku-regionleft');
        if( r % board.regionSize == 0 )
          cell.addClass('sudoku-regiontop');
        
        anchor.addClass('sudoku-cell-' + c + '-' + r);
        
        anchor.data('coords', [c, r]);
        anchor.data('board', board);
        row.append(cell);
        cells[r][c] = 0;
      }
      table.append(row);
    }

    table.updateCell = function(x, y, value) {
      var cell = $('.sudoku-cell-'+x+'-'+y, this.elem);
      cell.html(showValue(value));
    }
    
    table.clearCell = function(x, y) {
      var cell = $('.sudoku-cell-'+x+'-'+y, this.elem);
      cell.html('&nbsp;');    
    }

    table.popover({
      content: function() { return makeSelector.call(this, board, showValue); },
      container: 'body',
      placement: 'auto bottom',
      selector: '.sudoku-cell a',
      trigger: 'focus',
      html: true
    });
    
    $('body').on('click', '.sudoku-selector-btn', function () {
      var $this = $(this);
      var cell = $this.data('cell');
      var value = $this.data('value');
      
      var coords = cell.data('coords');
      
      cell.data('board').set(coords[0], coords[1], value);
    });
    
    $('body').on('click', '.sudoku-clear-btn', function() {
      var cell = $(this).data('cell');
      var coords = cell.data('coords');
      cell.data('board').clear(coords[0], coords[1]);
    });
    
    table.on('click', '.sudoku-cell a', function (e) {
      e.preventDefault();
    });
    
    this.append(table);
    $(window).resize(resize.bind(table));
    resize.call(table);
    
    return this;
  };
  
  function addStyle(id, selectors, properties) {
    var selectorString = selectors.join(', ');
    var propStrings = [];
    for( var prop in properties ) {
      propStrings.push(prop + ':' + properties[prop]);
    }
    
    var text = selectorString + ' { ' + propStrings.join(';') + ' }';
    
    var elem = $('#'+id);
    if( elem.length == 0 ) {
      elem = $('<style type="text/css"></style>')
      elem.prop('id', id);
      elem.appendTo('head');
    } 
    elem.text(text);
  }
  
  function resize() {
    this.css('height', this.css('width'));
    var anchors = $('a', this);
    var anchorSize = anchors.width();
    addStyle('sudoku-font-sizes', ['.sudoku-selector', '.sudoku-cell a'], { 
      'font-size': (anchorSize / 2) + 'px' 
    });
  }
 
  function makeSelector(board, showValue) {
    var $this = $(this);
    var size = board.size;
    var side = Math.floor(Math.sqrt(size));
    
    var result = $('<div class="sudoku-selector-container"></div>');
    
    var table = $('<table class="sudoku-selector"></table>');
    
    for( var r = 0; r < side; r++ ) {
      var row = $('<tr></tr>');
      for( var c = 0; c < side; c++ ) {
        var button = $('<td><button class="sudoku-selector-btn btn btn-default"></button></td>');
        var value = r * side + c + 1
        $('button', button).html(showValue(value))
          .data('cell', $this)
          .data('value', value);
        row.append(button);
      }
      table.append(row)
    }
    result.append(table);
    
    var clear = $('<button class="sudoku-clear-btn btn btn-default">Clear</button>');
    clear.data('cell', $this);
    
    result.append(clear);
        
    return result;
  }
}
