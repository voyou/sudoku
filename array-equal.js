function arrayEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length == b.length &&
          a.every(function (v, i) { 
            var bv = b[i];
            if( typeof v.length == 'undefined' || typeof bv.length == 'undefined' ) 
              return v == bv;
            else
              return arrayEqual(v, bv);
          });
}


module.exports = arrayEqual;
