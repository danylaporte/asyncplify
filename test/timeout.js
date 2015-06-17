var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('timeout', function () {
    asyncplify
		.interval(10)
		.timeout({
			delay: 1,
			other: asyncplify.value('test')
		})
		.pipe(tests.itShouldClose())
		.pipe(tests.itShouldEndAsync())
		.pipe(tests.itShouldEmitValues(['test']));

	asyncplify
		.interval(10)
		.timeout({
			delay: 1,
			other: asyncplify.throw('Timeout')
		})
		.pipe(tests.itShouldEndAsync({ error: 'Timeout' }));
})
