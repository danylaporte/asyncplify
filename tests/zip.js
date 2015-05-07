var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('zip', function () {

    var source = asyncplify.zip([asyncplify.value(0), asyncplify.fromArray([1, 2])]);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [[0, 1]]);
    
    source = asyncplify
        .zip({
            items: [asyncplify.value(0), asyncplify.fromArray([1, 2])],
            mapper: function (x, y) { return {x: x, y: y}; }
        });
        
    common.itShouldEmitValues(source, [{x: 0, y: 1}], 'should support a mapper');
    
    source = asyncplify.zip([asyncplify.range(4), asyncplify.interval(1)]);
    common.itShouldEmitValues(source, [[0, 0], [1, 1], [2, 2], [3,3]], 'should finish with interval');
})
