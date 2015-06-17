var asyncplify = require('../dist/asyncplify');
var tests = require('asyncplify-tests');

describe('scan', function(){
    asyncplify
        .range(3)
        .scan()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1, 3]));
    
    asyncplify
        .fromArray([1, 2])
        .scan(function (acc, v) { return (acc + 1) * v })
        .pipe(tests.itShouldEmitValues({
            title: 'should support a mapper',
            values: [1, 4]
        }));
        
    asyncplify
        .fromArray([1, 2])
        .scan({ initial: 1 })
        .pipe(tests.itShouldEmitValues({
            title: 'should support having an initial value',
            values: [2, 4]
        }));
        
    asyncplify
        .range({start: 1, end: 4})
        .scan({
            initial: 1,
            mapper: function (acc, x) {
                return acc * x;
            }
        })
        .pipe(tests.itShouldEmitValues({
            title: 'should support having an initial value with a mapper',
            values: [1, 2, 6]
        }));
});