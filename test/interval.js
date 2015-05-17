var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('interval', function () {
    it('should emit first value after a delay', function (done) {
        var count = 0;
        var start = Date.now();

        asyncplify
            .interval(10)
            .take(1)
            .subscribe({
                emit: function (v) {
                    v.should.equal(0);
                    count++;

                    var delay = Date.now() - start;
                    count.should.equal(1);
                    delay.should.be.approximately(10, 8);

                },
                end: function (err) {
                    assert(err === null);
                    count.should.equal(1);
                    done();
                }
            })
    })
    
    var source = asyncplify.interval(1).take(1);
    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndAsync(source);
    
    source = asyncplify.interval(1).take(3);
    common.itShouldEmitValues(source, [0, 1, 2]);
})
