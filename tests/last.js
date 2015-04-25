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

    common.itShouldEmitValue(source, 2, 'should take a function');

    source = asyncplify
        .range(4)
        .last({
            count: 2,
            cond: function (v) { return v < 3; }
        });

    common.itShouldEmitValues(source, [1, 2], 'should take a function and a count');
})
