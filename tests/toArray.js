var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('toArray', function () {
    var source = asyncplify.value(1).toArray();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValue(source, [1]);

    it('should allow to split at a length', function () {
        var count = 0;
        var array = [];

        asyncplify
            .range(4)
            .toArray({ split: 2 })
            .subscribe({
                emit: function (v) { array.push(v); },
                end: function (err) {
                    assert(err === null);
                    count++;
                }
            });

        array.should.eql([[0,1], [2,3]]);
        count.should.equal(1);
    })

    it('should allow to split by a condition', function () {
        var count = 0;
        var array = [];

        function cond(x) { return x == 2; }

        asyncplify
            .range(4)
            .toArray({ split: cond })
            .subscribe({
                emit: function (v) { array.push(v); },
                end: function (err) {
                    assert(err === null);
                    count++;
                }
            });

        array.should.eql([[0,1], [2,3]]);
        count.should.equal(1);
    })

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
    })
})
