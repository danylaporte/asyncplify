var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');
var tests = require('asyncplify-tests');

describe('toArray', function () {
    asyncplify
        .value(1)
        .toArray()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([[1]]));
    
    asyncplify
        .range(4)
        .toArray({ split: 2 })
        .pipe(tests.itShouldEmitValues({
            title: 'should allow to split at a length',
            values: [[0,1], [2,3]]
        }));
    
    asyncplify
        .range(4)
        .toArray({ split: function (x) { return x === 2 } })
        .pipe(tests.itShouldEmitValues({
            title: 'should allow to split by a condition',
            values: [[0,1], [2,3]]
        }));

    it('should allow to split by a trigger', function () {
        var count = 0;
        var array = [];
        var trigger = asyncplify.subject();
        var emitter = asyncplify.subject();

        emitter
            .toArray({ split: trigger })
            .subscribe({
                emit: function (v) { array.push(v); },
                end: function (err) {
                    assert(err === null);
                    count++;
                }
            });

        emitter.emit(0);
        emitter.emit(1);

        array.should.eql([]);

        trigger.emit();

        emitter.emit(2);
        emitter.emit(3);
        emitter.end(null);

        array.should.eql([[0,1], [2,3]]);
        count.should.equal(1);
    });
});