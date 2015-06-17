var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('skipWhile', function () {
    asyncplify
        .range(4)
        .skipWhile(function (v) { return v < 2; })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([2, 3]));
});