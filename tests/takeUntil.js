var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('takeUntil', function () {
    var source = asyncplify.range(2).takeUntil(asyncplify.subject());

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

    it('should returns the values before trigger is activated', function () {
        var array = [];
        var subject = asyncplify.subject();
        var trigger = asyncplify.subject();

        subject
            .takeUntil(trigger)
            .subscribe(function (v) {
                array.push(v);
            })

        subject.emit(0);
        subject.emit(1);

        array.should.eql([0, 1]);

        trigger.emit();
        subject.end();

        array.should.eql([0, 1]);
    })
})
