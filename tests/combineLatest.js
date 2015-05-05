var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('combineLatest', function () {

    var source = asyncplify.combineLatest([asyncplify.value(0), asyncplify.fromArray([1, 2])]);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [[0, 1], [0, 2]]);
    
    source = asyncplify
        .combineLatest({
            items: [asyncplify.value(0), asyncplify.fromArray([1, 2])],
            mapper: function (x, y) { return {x: x, y: y}; }
        });
        
    common.itShouldEmitValues(source, [{x: 0, y: 1}, {x: 0, y: 2}], 'should support a mapper');
    
    source = asyncplify
        .combineLatest({
            emitUndefined: true,
            items: [asyncplify.value(0), asyncplify.fromArray([1, 2])]
        });
        
    common.itShouldEmitValues(source, [[0, undefined], [0, 1], [0, 2]], 'should allow to emit undefined values');
})
