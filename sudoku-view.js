/* global window */

"use strict";

var S = require('./sudoku');
var arrayEqual = require('./array-equal');

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
  clear: function(x, y) {
    this.cells[y][x] = 0;
    this.view.clearCell(x, y);
    this.view.elem.trigger('sudoku:not-filled');
  },
  clearAll: function() {
    for(var y = 0; y < this.size; y++ )
      for( var x = 0; x < this.size; x++ )
        this.clear(x, y);
  },
  isFilled: function() {
    return this.cells.every( function(row) { 
      return row.every( function(c) { return c !== 0; } ); 
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
};

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
  updateCell: function(x, y, value, fixed) {
    var cell = $('.sudoku-cell-'+x+'-'+y, this.table);
    cell.html(this.showValue(value));
    if( fixed ) 
      cell.addClass('sudoku-cell-fixed');
  },
  
  clearCell: function(x, y) {
    var cell = $('.sudoku-cell-'+x+'-'+y, this.table);
    cell.html('&nbsp;');
    cell.removeClass('sudoku-cell-fixed');    
  },
  
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

function GridController(view, model) {
  this.view = view;
  this.model = model;
  
  var  makeSelector = this.view.makeSelector.bind(this.view);
  this.view.table.popover({
    content: function() { return makeSelector($(this)); },
    container: 'body',
    placement: 'auto bottom',
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


var $;

exports.init = function(jQuery) {
  $ = jQuery;
  $.fn.sudoku = function(size, showValue) {
  
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
