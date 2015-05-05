var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('subscribeOn', function () {
    var source = asyncplify.range(3).subscribeOn();
    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndAsync(source);
	common.itShouldEmitValues(source, [0, 1, 2]);
})