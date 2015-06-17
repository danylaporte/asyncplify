var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('subscribeOn', function () {
    asyncplify
        .range(3)
        .subscribeOn()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndAsync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
});