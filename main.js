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
/* global jQuery */
/* global $ */

"use strict";

var SV = require('./sudoku-view');
SV.init(jQuery);

var t = ['S̷', 'S<sub>1</sub>', 'S<sub>2</sub>', '<i>a</i>'];

$(function() {
  $('#main').sudoku(4, function(i) { return t[i-1]; })
    .on('sudoku:filled', function(e, solved) {
      if( solved ) {
        $('#failure').hide();
        $('#success').fadeIn();
      } else {
        $('#success').hide();
        $('#failure').fadeIn();
      }
    }).on('sudoku:not-filled', function() {
        $('#failure').fadeOut();
        $('#success').fadeOut();      
    }); 
    
  $('#sudoku-reset').on('click', function() {
    $('#main').sudoku('reset');
  }); 
  
  $('#sudoku-new').on('click', function() {
    $('#main').sudoku('regenerate');
  });
  
});



