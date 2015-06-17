var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('empty', function () {
    asyncplify
        .empty()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues({
            title: 'should not returns a value',
            values: []
        }));
});