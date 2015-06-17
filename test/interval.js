var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');
var tests = require('asyncplify-tests');

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
            });
    });
    
    asyncplify
        .interval(1)
        .take(3)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndAsync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
});