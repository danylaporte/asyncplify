var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('take', function () {
    var source = asyncplify.range(10).take(2);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);
})
