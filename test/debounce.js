var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('debounce', function () {
    var source = asyncplify
        .interval(5)
        .debounce(10)
		.take(1);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndAsync(source);
    common.itShouldEmitValues(source, [2]);
})