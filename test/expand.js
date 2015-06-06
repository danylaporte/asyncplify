var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('expand', function () {
    var source = asyncplify
        .value(42)
        .expand(function (x) { return asyncplify.value(42 + x); })
		.take(5);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [42, 84, 126, 168, 210]);
});