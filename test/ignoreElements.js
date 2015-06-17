var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('ignoreElements', function () {
    asyncplify
        .range(2)
        .ignoreElements()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([]));
});