"use strict";

exports.init = function($) {
  $.fn.sudoku = function(size, showValue) {

    var regionSize = Math.floor(Math.sqrt(size));
  
    if( typeof showValue == 'undefined' )
      showValue = function (i) { return i; }
  
    var board = {
      size: size,
      regionSize: regionSize,
      showValue: showValue
    }
  
    var cellWidth = 100 / size;
    
    var table = $('<table class="sudoku-grid"></table>');
    for( var r = 0; r < size; r++ ) {
      var row = $('<tr>');
      for( var c = 0; c < size; c++ ) {
        var cell = $('<td class="sudoku-cell"><a href="">&nbsp;</a></td>')
        var anchor = $('a', cell);
        
        cell.css('width', cellWidth + '%');
        if( r == (size - 1) )
          cell.addClass('sudoku-bottom');
        if( c == (size - 1) )
          cell.addClass('sudoku-right');
        if( c % regionSize == 0 )
          cell.addClass('sudoku-regionleft');
        if( r % regionSize == 0 )
          cell.addClass('sudoku-regiontop');
        
        anchor.data('coords', [c, r]);
        anchor.data('board', board);
        row.append(cell);
      }
      table.append(row);
    }

    table.popover({
      content: makeSelector,
      container: 'body',
      placement: 'auto bottom',
      selector: '.sudoku-cell a',
      trigger: 'focus',
      html: true
    });
    
    $('body').on('click', '.sudoku-selector-btn', function () {
      var $this = $(this);
      var cell = $this.data('cell');
      cell.text(cell.data('board').showValue($this.data('value')));
    });
    
    table.on('click', '.sudoku-cell a', function (e) {
      e.preventDefault();
    });
    
    this.append(table);
    $(window).resize(resize.bind(table));
    resize.call(table);
    
    return this;
  };
  
  function resize() {
    this.css('height', this.css('width'));
    var anchors = $('a', this);
    var anchorSize = anchors.width();
    console.log(anchorSize);
    anchors.css('font-size', anchorSize / 2 + 'px');
  }
 
  function makeSelector() {
    var $this = $(this);
    var board = $this.data('board');
    var size = board.size;
    var side = Math.floor(Math.sqrt(size));
    
    var table = $('<table class="sudoku-selector"></table>');
    
    for( var r = 0; r < side; r++ ) {
      var row = $('<tr></tr>');
      for( var c = 0; c < side; c++ ) {
        var button = $('<td><button class="sudoku-selector-btn btn btn-default"></button></td>');
        var value = r * side + c + 1
        $('button', button).text(board.showValue(value))
          .data('cell', $this)
          .data('value', value);
        row.append(button);
      }
      table.append(row)
    }
    
    return table;
  }
}
