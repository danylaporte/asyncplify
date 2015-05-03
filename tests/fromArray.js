var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('fromArray', function () {
    var source = asyncplify.fromArray([0, 1]);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

    it('should call end on empty array', function () {
        var count = 0;

        asyncplify
            .fromArray([])
            .subscribe({
                emit: function (v) {
                    assert(false);
                },
                end: function (err) {
                    assert(err === null);
                    count++;
                }
            });

        count.should.equal(1);
    })
    
    it('should not loop infinitely when pausing / resuming', function (done) {
        asyncplify
            .fromArray([0, 1])
            .flatMap({
                mapper: function (x) {
                    if (x === 1)
                        return asyncplify.value('b');

                    return asyncplify
                        .interval(1)
                        .take(2)
                        .map(function () { return 'a'; });
                },
                maxConcurrency: 1
            })
            .toArray()
            .subscribe(function(v) {
                v.should.eql(['a', 'a', 'b']);
                done();
            })
    })
})
