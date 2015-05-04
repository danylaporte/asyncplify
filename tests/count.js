var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('count', function(){
    var source = asyncplify.range(4).count();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [4]);
	
	var source = asyncplify
		.fromArray([1, 2, 3, 4])
        .count(function (v) { return v % 2 });
		
	common.itShouldEmitValues(source, [2], 'should support having a filter');
})
