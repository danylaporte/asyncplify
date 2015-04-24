var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('skipLast', function () {
    var source = asyncplify
        .range(4)
        .skipLast(2);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);
})
