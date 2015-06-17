var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('skip', function () {
    asyncplify
        .range(5)
        .skip(2)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([2, 3, 4]));
});