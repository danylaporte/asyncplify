var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('takeWhile', function () {
    asyncplify
        .range(10)
        .takeWhile(function (v) { return v < 2; })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
});