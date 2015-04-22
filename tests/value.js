var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('value', function () {
    var source = asyncplify.value(10);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValue(source, 10);
})
