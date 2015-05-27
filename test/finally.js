var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('finally', function () {
    var source = asyncplify
        .range(2)
        .finally(function () {  });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

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