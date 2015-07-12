var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('concat', function () {
    asyncplify
        .concat([asyncplify.value(0), asyncplify.fromArray([1, 2])])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
		
});

describe('concat-proto', function () {
	asyncplify
		.value(0)
		.concat([asyncplify.fromArray([1, 2])])
		.pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
});