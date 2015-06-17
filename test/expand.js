var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('expand', function () {
    asyncplify
        .value(42)
        .expand(function (x) { return asyncplify.value(42 + x); })
		.take(5)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([42, 84, 126, 168, 210]));
});