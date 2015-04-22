var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('sum', function(){
    var source = asyncplify.range(3).sum();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValue(source, 3);

    it('should support having a mapper',  function (done) {
        asyncplify.fromArray([1, 2])
            .sum(function (v) { return v + 2 })
            .subscribe(function (v) {
                v.should.equal(7);
                done();
            })
    })
})
