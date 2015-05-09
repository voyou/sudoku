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


/** 
 * Simple equality test which test arrays for deep equality. 
 *
 * Note that only arrays are compared deeply; all other objects are simply
 * tested for equality using '==='.
*/
function arrayEqual(a, b) {
  if( !(Array.isArray(a) && Array.isArray(b)) )
    return a === b;
    
  return a.length == b.length &&
         a.every(function (v, i) { 
           return arrayEqual(v, b[i]);
         });
}


module.exports = arrayEqual;
