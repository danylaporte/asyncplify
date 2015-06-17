var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');
var should = require('should');

describe('flatMap', function () {
    asyncplify
        .range(2)
        .flatMap(function (v) { return asyncplify.value(v); })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));

    it('should call mapper for each item', function () {
        var mapperCount = 0;

        asyncplify
            .range(2)
            .flatMap(function (x) {
                mapperCount++;
                return asyncplify.value(x);
            })
            .subscribe(function () { });

        mapperCount.should.equal(2);
    });
    
    asyncplify
        .range(2)
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
        .pipe(tests.itShouldEmitValues({
            title: 'should support maxConcurrency',
            values: ['a', 'a', 'b']
        }));
});