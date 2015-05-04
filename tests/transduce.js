var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');
var t = require('transducers-js');

describe('transduce', function(){
    var source = asyncplify
		.fromArray([1, 2, 3, 4, 5, 6])
		.transduce(t.comp(
			t.map(function (x) { return x + 10; }),
			t.filter(function (x) { return x % 2 === 0; }),
			t.take(2)
		));

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [12, 14]);
})