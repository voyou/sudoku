"use strict";

var SV = require('./sudoku-view');
SV.init(jQuery);

$(function() {
  $('#main').sudoku(4, function(i) { return ['a', 'b', 'c', 'd'][i-1]; });
});


