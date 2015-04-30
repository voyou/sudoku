var arrayEqual = require('../array-equal.js');

exports.testNotArrays = function(test) {
  test.ok(!arrayEqual(1, 2));
  test.ok(!arrayEqual('a', 'b'));
  test.ok(!arrayEqual({}, {foo:1}));
  test.done();
}

exports.testEmptyArray = function(test) {
  test.ok(arrayEqual([], []));
  test.ok(!arrayEqual([], [1]));
  test.done();
}

exports.testSimpleArray = function(test) {
  test.ok(arrayEqual([1, 2], [1, 2]));
  test.ok(!arrayEqual([1, 2], [1, 2, 3]));
  test.ok(!arrayEqual([1, 2], [2, 3]));
  test.done();
}

exports.testNestedArray = function(test) {
  test.ok(arrayEqual([[1], [2, 3]], [[1], [2, 3]]));
  test.ok(!arrayEqual([1, [2, 3]], [[1, 2, 3]]));
  test.done();
}
