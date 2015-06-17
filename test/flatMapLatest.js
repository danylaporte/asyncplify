var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('flatMapLatest', function () {
    asyncplify
        .range(2)
        .flatMapLatest(function (v) { return asyncplify.value(v); })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));

    asyncplify
        .range(2)
        .flatMapLatest(function (v) { return asyncplify.value(v).observeOn(); })
        .pipe(tests.itShouldEmitValues([1]));
});