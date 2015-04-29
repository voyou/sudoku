"use strict";

var SV = require('./sudoku-view');
SV.init(jQuery);

$(function() {
  $('#main').sudoku(4);
});


