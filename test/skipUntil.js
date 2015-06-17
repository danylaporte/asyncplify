var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');
var tests = require('asyncplify-tests');

describe('skipUntil', function () {
    asyncplify
        .range(2)
        .skipUntil(asyncplify.subject())
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([]));

    it('should returns the values after trigger is activated', function () {
        var array = [];
        var subject = asyncplify.subject();
        var trigger = asyncplify.subject();

        subject
            .skipUntil(trigger)
            .subscribe({
                emit: function (v) {
                    array.push(v);
                },
                end: function (err) {
                    assert(err === null);
                }
            })

        subject.emit(0);
        subject.emit(1);

        array.should.eql([]);

        trigger.emit();

        subject.emit(2);
        subject.emit(3);
        subject.end(null);

        array.should.eql([2, 3]);
    });
});