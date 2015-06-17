var asyncplify = require('../dist/asyncplify');
var should = require('should');
var tests = require('asyncplify-tests');

describe('fromArray', function () {
    asyncplify
        .fromArray([0, 1])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
        
    asyncplify
        .fromArray([])
        .pipe(tests.itShouldEmitValues([]));
    
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
            });
    });
});