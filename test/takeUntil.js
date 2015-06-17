var asyncplify = require('../dist/asyncplify');
var should = require('should');
var tests = require('asyncplify-tests');

describe('takeUntil', function () {
    asyncplify
        .range(2)
        .takeUntil(asyncplify.subject())
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));

    it('should returns the values before trigger is activated', function () {
        var array = [];
        var subject = asyncplify.subject();
        var trigger = asyncplify.subject();

        subject
            .takeUntil(trigger)
            .subscribe(function (v) {
                array.push(v);
            });

        subject.emit(0);
        subject.emit(1);

        array.should.eql([0, 1]);

        trigger.emit();
        subject.end();

        array.should.eql([0, 1]);
    });
});