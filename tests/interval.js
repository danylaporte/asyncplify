var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');

describe('interval', function () {
    it('should emit first value after a delay', function (done) {
        var count = 0;
        var array = [];
        var start = new Date();

        asyncplify
            .interval(10)
            .take(1)
            .subscribe({
                emit: function (v) {
                    assert(v === undefined);
                    count++;

                    var delay = new Date() - start;
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
})
