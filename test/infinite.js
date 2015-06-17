var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('infinite', function () {
    asyncplify
        .infinite()
        .take(1)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([undefined]));
});