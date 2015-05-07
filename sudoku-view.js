"use strict";

var S = require('./sudoku');
var arrayEqual = require('./array-equal');

function GridModel(size, cells, elem, showValue) {
  this.size = size;
  this.regionSize = Math.floor(Math.sqrt(size));
  this.cells = cells;
  this.elem = elem;
}

GridModel.prototype = {
  set: function(x, y, value, fixed) {
    if( typeof fixed === 'undefined' )
      fixed = false;
      
    this.cells[y][x] = value;
    
    if( this.isFilled() ) { 
      var solved = arrayEqual(this.cells, this.solution);
      this.elem.parent().trigger('sudoku:filled', solved);
    }
      
    this.elem.updateCell(x, y, value, fixed);    
  },
  clear: function(x, y) {
    this.cells[y][x] = 0;
    this.elem.clearCell(x, y);
    this.elem.parent().trigger('sudoku:not-filled');
  },
  clearAll: function(x, y) {
    for(var y = 0; y < this.size; y++ )
      for( var x = 0; x < this.size; x++ )
        this.clear(x, y);
  },
  isFilled: function() {
    return this.cells.every( function(row) { 
      return row.every( function(c) { return c != 0; }) 
    });
  },
  fillClues: function() {
    this.clearAll();
    this.clues.forEach(function (clue) {
      this.set(clue[0], clue[1], clue[2], true);
    }.bind(this));
  },
  generate: function() {
    var generated = S.Board.generate(this.size, true);
    this.solution = generated.solution;
    this.clues = generated.clues;
    this.fillClues();
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
        if( r === (size - 1) )
          cell.addClass('sudoku-bottom');
        if( c === (size - 1) )
          cell.addClass('sudoku-right');
        if( c % board.regionSize === 0 )
          cell.addClass('sudoku-regionleft');
        if( r % board.regionSize === 0 )
          cell.addClass('sudoku-regiontop');
        
        anchor.addClass('sudoku-cell-' + c + '-' + r);
        
        anchor.data('coords', [c, r]);
        anchor.data('board', board);
        row.append(cell);
        cells[r][c] = 0;
      }
      table.append(row);
    }

    table.updateCell = function(x, y, value, fixed) {
      var cell = $('.sudoku-cell-'+x+'-'+y, this.elem);
      cell.html(showValue(value));
      if( fixed ) 
        cell.addClass('sudoku-cell-fixed');
    }
    
    table.clearCell = function(x, y) {
      var cell = $('.sudoku-cell-'+x+'-'+y, this.elem);
      cell.html('&nbsp;');
      cell.removeClass('sudoku-cell-fixed');    
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

    board.generate();
    
    table.data('board', board);
    this.data('sudoku-model', board);

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
    addStyle('sudoku-lock-size', ['.sudoku-fixed-icon'], {
      'font-size': (anchorSize * this.data('board').regionSize / 4) + 'px'
    });
  }
 
  function makeSelector(board, showValue) {
    var $this = $(this);
    var size = board.size;
    var side = Math.floor(Math.sqrt(size));
    
    var result = $('<div class="sudoku-selector-container"></div>');
    
    if( $this.hasClass('sudoku-cell-fixed') ) {
      result.append($('<span class="glyphicon glyphicon-lock sudoku-fixed-icon" title="The value of an initial clue cannot be changed"></span><span class="sr-only">The value of an initial clue cannot be changed</span>'));
      return result;
    }
    
    
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
