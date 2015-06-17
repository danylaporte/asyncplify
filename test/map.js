var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('map', function () {
    asyncplify
        .range(2)
        .map(function (v) { return v + 2; })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([2, 3]));
});