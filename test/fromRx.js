var asyncplify = require('../dist/asyncplify');
var rx = require('rx');
var tests = require('asyncplify-tests');

describe('fromRx', function () {
    asyncplify
        .fromRx(rx.Observable.range(0, 3))
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1, 2]));
});