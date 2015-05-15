var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('observeOn', function () {
    var source = asyncplify.range(3).observeOn();
    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndAsync(source);
	common.itShouldEmitValues(source, [0, 1, 2]);
})