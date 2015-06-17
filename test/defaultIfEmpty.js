var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('defaultIfEmpty', function () {
    asyncplify
        .empty()
        .defaultIfEmpty(1)
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues({
            title: 'should emit default value on empty',
            values: [1]
        }));
        
    asyncplify
        .range(3)
        .defaultIfEmpty(1)
        .pipe(tests.itShouldEmitValues({
            title: 'should not emit default value on non-empty',
            values: [0, 1, 2]
        }));
});