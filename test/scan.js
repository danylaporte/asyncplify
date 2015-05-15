var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('scan', function(){
    var source = asyncplify.range(3).scan();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1, 3]);
    
    source = asyncplify
        .fromArray([1, 2])
        .scan(function (acc, v) { return (acc + 1) * v });
    
    common.itShouldEmitValues(source, [1, 4], 'should support having a mapper');
    
    source = asyncplify
        .fromArray([1, 2])
        .scan({ initial: 1 });
    
    common.itShouldEmitValues(source, [2, 4], 'should support having an initial value');
    
    source = asyncplify
        .fromArray([1, 2])
        .scan({ initial: 1 });
    
    source = asyncplify
        .range({start: 1, end: 4})
        .scan({
            initial: 1,
            mapper: function (acc, x) {
                return acc * x;
            }
        });
    
    common.itShouldEmitValues(source, [1, 2, 6], 'should support having an initial value with a mapper');
})
