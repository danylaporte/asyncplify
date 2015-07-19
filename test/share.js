var asyncplify = require('../dist/asyncplify');
var should = require('should');
var tests = require('asyncplify-tests');

describe('share', function () {
    asyncplify
        .range(2)
        .share()
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndAsync())
        .pipe(tests.itShouldEmitValues([0, 1]));

    it('should emit event while a subscription is made', function () {

        var subject = asyncplify.subject();
        var array1 = [];
        var array2 = [];
        var tapArray = [];

        var source = subject
            .tap(tapArray.push.bind(tapArray))
            .share(asyncplify.schedulers.sync);

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
    });

    var count = 0;
    var shared = asyncplify.range(10).tap(function (x) { count++; }).share();

    shared.pipe(tests.itShouldEmitValues({ title: 'share 1 should emit the same values as share 2.', items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }));
    shared.pipe(tests.itShouldEmitValues({ title: 'share 2 should emit the same values as share 1.', items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }));
    
    shared
        .ignoreElements()
        .concatMap(function () { asyncplify.value(count); })
        .pipe(tests.itShouldEmitValues({ title: 'should not duplicate invocation.', items: [] }));

});