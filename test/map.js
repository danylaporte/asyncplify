var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('map', function () {
    var source = asyncplify
        .range(2)
        .map(function (v) { return v + 2; });

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [2, 3]);
})
