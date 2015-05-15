var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('take', function () {
    var source = asyncplify.range(10).take(2);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1], 'should take a count');

    source = asyncplify
        .range(4)
        .take(function (v) { return v > 1; });

    common.itShouldEmitValues(source, [2, 3], 'should take a function');

    source = asyncplify
        .range(4)
        .take({
            count: 1,
            cond: function (v) { return v > 1; }
        });

    common.itShouldEmitValues(source, [2], 'should take a function and a count');

    source = asyncplify
        .range(4)
        .take(0);

    common.itShouldEmitValues(source, [], 'should not emit value when count is 0');
})
