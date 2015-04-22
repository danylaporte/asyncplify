var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('filter', function () {
    var source = asyncplify
        .range(4)
        .filter(function (v) { return v < 2; });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);
})
