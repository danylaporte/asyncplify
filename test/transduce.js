var asyncplify = require('../dist/asyncplify');
var t = require('transducers-js');
var tests = require('asyncplify-tests');

describe('transduce', function(){
    asyncplify
		.fromArray([1, 2, 3, 4, 5, 6])
		.transduce(t.comp(
			t.map(function (x) { return x + 10; }),
			t.filter(function (x) { return x % 2 === 0; }),
			t.take(2)
		))
		.pipe(tests.itShouldClose())
		.pipe(tests.itShouldEndSync())
		.pipe(tests.itShouldEmitValues([12, 14]));
});