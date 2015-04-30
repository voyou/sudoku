"use strict";

var SV = require('./sudoku-view');
SV.init(jQuery);

var t = ['S̷', 'S₁', 'S₂', '𝑎'];

$(function() {
  $('#main').sudoku(4, function(i) { return t[i-1]; });  
});


