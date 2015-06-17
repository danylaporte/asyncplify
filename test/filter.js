var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('filter', function () {
    asyncplify
        .range(4)
        .filter(function (v) { return v < 2; })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
});