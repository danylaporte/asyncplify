var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('infinite', function () {
    var source = asyncplify.infinite().take(1);
    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [undefined]);
});