var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('concatMap', function () {
    asyncplify
	.range({ start: 1, end: 4 })
        .concatMap(function (x) {
                return asyncplify.range(x);
        })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 0, 1, 0, 1, 2]));
});