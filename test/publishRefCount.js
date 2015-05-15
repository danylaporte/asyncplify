var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('publishRefCount', function() {
    var source = asyncplify.range(2).publishRefCount();

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

    it('should emit event while a subscription is made', function () {

        var subject = asyncplify.subject();
        var array1 = [];
        var array2 = [];
        var tapArray = [];

        var source = subject
            .tap(tapArray.push.bind(tapArray))
            .publishRefCount();

        var s1 = source.subscribe(array1.push.bind(array1));
        var s2 = source.subscribe(array2.push.bind(array2));

        subject.emit(1);
        subject.emit(2);

        array1.should.eql([1, 2]);
        array2.should.eql([1, 2]);
        tapArray.should.eql([1, 2]);

        s1.close();
        subject.emit(3);
        subject.emit(4);

        subject.end(null);

        array1.should.eql([1, 2]);
        array2.should.eql([1, 2, 3, 4]);
        tapArray.should.eql([1, 2, 3, 4]);
    })
})
