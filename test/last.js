var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('last', function () {
    var source = asyncplify
        .range(4)
        .last(2);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [2, 3], 'should take a count');

    source = asyncplify
        .range(4)
        .last(function (v) { return v < 3; });

    common.itShouldEmitValues(source, [2], 'should take a function');

    source = asyncplify
        .range(4)
        .last({
            count: 2,
            cond: function (v) { return v < 3; }
        });

    common.itShouldEmitValues(source, [1, 2], 'should take a function and a count');

    source = asyncplify
        .range(4)
        .last(0);

    common.itShouldEmitValues(source, [], 'should not emit value when count is 0');

    source = asyncplify
        .range(4)
        .last(-1);

    common.itShouldEmitValues(source, [0, 1, 2, 3], 'should emit all values when count is negative');
})
