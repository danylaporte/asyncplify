var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');
var tests = require('asyncplify-tests');

describe('merge', function () {

    asyncplify
        .merge([asyncplify.value(0), asyncplify.value(1)])
        .pipe(tests.itShouldClose())
        .pipe(tests.itShouldEndSync())
        .pipe(tests.itShouldEmitValues([0, 1]));
        
    it('support passing a maxConcurrency', function () {
        var count = 0;
        var array = [];

        var subject = asyncplify.subject();

        asyncplify.merge({
                items: [subject, asyncplify.value(2)],
                maxConcurrency: 1
            })
            .subscribe({
                emit: function (v) {
                    array.push(v);
                },
                end: function(err) {
                    assert(err === null);
                    count++;
                }
            });

        array.should.eql([]);
        subject.emit(1);
        array.should.eql([1]);
        subject.end();
        array.should.eql([1, 2]);
        count.should.equal(1);
    });
    
    asyncplify
        .merge([asyncplify.value(0), asyncplify.interval(1)])
        .pipe(tests.itShouldClose({ title: 'should not throw on closing in child item'}));
});