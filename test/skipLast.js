var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('skipLast', function () {
    asyncplify
        .range(4)
        .skipLast(2)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
});