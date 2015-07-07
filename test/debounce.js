var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('debounce', function () {
    asyncplify
        .interval(15)
        .debounce(10)
		.take(1)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndAsync())
        .pipe(tests.itShouldEmitValues([0]));
});