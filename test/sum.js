var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('sum', function(){
    asyncplify
        .range(3)
        .sum()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([3]));
        
    asyncplify
        .fromArray([1, 2])
        .sum(function (v) { return v + 2; })
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues({
            title: 'should support having a mapper',
            values: [7]
        }));
});