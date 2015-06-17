var asyncplify = require('../dist/asyncplify');
var should = require('should');
var tests = require('asyncplify-tests');

describe('finally', function () {
    asyncplify
        .range(2)
        .finally(function () {  })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));

    it('should call action on close', function () {
        var count = 0;

        var s = asyncplify
            .never()
            .finally(function () {
                count++;
            })
            .subscribe();

        count.should.equal(0);
        s.close();
        s.close();
        count.should.equal(1);
    });
    
    it('should call action on close only once', function () {
        var count = 0;

        var s = asyncplify
            .value(1)
            .finally(function () {
                count++;
            })
            .subscribe();

        count.should.equal(1);
        s.close();
        s.close();
        count.should.equal(1);
    });
});