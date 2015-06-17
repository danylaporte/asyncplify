var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('range', function () {
    asyncplify
        .range(2)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
});