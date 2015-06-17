var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('fromNode', function () {
    asyncplify
        .fromNode(function (cb) { cb(null, 10); })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([10]));
});