"use strict";

// Tests for value equality of arrays (and arrays of arrays, etc.).
if( typeof Array.equals === 'undefined' )
  Array.prototype.equals = function(other) {
    if( ! Array.isArray(other) )
      return false;
    if( this.length !== other.length )
      return false;
    for( var i = 0; i < this.length; i++ ) {
      var thise = this[i];
      var othere = other[i];
      if( Array.isArray(thise) ) {
        if( !thise.equals(othere) )
          return false;
      } else if( thise !== othere )
        return false;
    }
    return true;
  }


// Remove the first instance of the given value from the array.
if( typeof Array.remove === 'undefined' )
  Array.prototype.remove = function(toRemove) {
    var i = this.indexOf(toRemove);
    if( i == - 1 )
      return;
    this.splice(i, 1);
  }
  
// Deep copy arrays of arrays. Note that this specifically *does not* 
// deep copy non-array object;
if( typeof Array.deepCopy === 'undefined' )
  Array.prototype.deepCopy = function() {
    var copy = [];
    for( var i = 0; i < this.length; i++ ) {
      var e = this[i];
      if( Array.isArray(e) )
        copy[i] = e.deepCopy();
      else
        copy[i] = e;
    }
    return copy;
  }
