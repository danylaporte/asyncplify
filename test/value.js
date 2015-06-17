var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('value', function () {
    asyncplify
        .value(10)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([10]));
});