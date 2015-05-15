var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('range', function () {
    var source = asyncplify.range(2);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);
})
