var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('skip', function () {
    var source = asyncplify.range(5).skip(2);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [2, 3, 4]);
})
