var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('zip', function () {
    asyncplify
        .zip([asyncplify.value(0), asyncplify.fromArray([1, 2])])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([[0, 1]]));
    
    asyncplify
        .zip({
            items: [asyncplify.value(0), asyncplify.fromArray([1, 2])],
            mapper: function (x, y) { return {x: x, y: y}; }
        })
        .pipe(tests.itShouldEmitValues({
            title: 'should support a mapper', 
            values: [{x: 0, y: 1}]
        }));
        
    asyncplify
        .zip([asyncplify.range(4), asyncplify.interval(1)])
        .pipe(tests.itShouldEmitValues({
            title: 'should finish with interval', 
            values: [[0, 0], [1, 1], [2, 2], [3,3]]
        }));
});