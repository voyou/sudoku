"use strict";

var SV = require('./sudoku-view');
SV.init(jQuery);

var t = ['S̷', 'S<sub>1</sub>', 'S<sub>2</sub>', '<i>a</i>'];

$(function() {
  $('#main').sudoku(4, function(i) { return t[i-1]; });  
});


