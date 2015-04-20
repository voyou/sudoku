require('../array.js');

exports.equals = function(test) {
  test.ok([1, 2, 3].equals([1, 2, 3]));
  test.done();
}

exports.equalsDiffLength = function(test) {
  test.ok(! [1, 2, 3].equals([1, 2]));
  test.done();
}

exports.equalsDeep = function(test) {
  test.ok([[1], [2, 3]].equals([[1], [2, 3]]));
  test.done();
}

exports.remove = function(test) {
  var a = [1, 2, 3];
  a.remove(2);
  test.ok(a.equals([1, 3]));
  test.done();
}

exports.removeNoneExistent = function(test) {
  var a = [1, 2, 3];
  a.remove(4);
  test.ok(a.equals([1, 2, 3]));
  test.done();
}

exports.deepCopy = function(test) {
  var a = [[1], [2], [2]];
  var b = a.deepCopy();
  a[1][0] = 4;
  test.ok(!a.equals(b));
  test.done();
}
