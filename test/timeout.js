var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('timeout', function () {
    var source = asyncplify
		.interval(10)
		.timeout({
			delay: 1,
			other: asyncplify.value('test')
		});

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndAsync(source);
    common.itShouldEmitValues(source, ['test']);

	source = asyncplify
		.interval(10)
		.timeout({
			delay: 1,
			other: asyncplify.throw('Timeout')
		});
		
	common.itShouldEndWithError(source, 'Timeout');
})
