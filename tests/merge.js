var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var common = require('./common');
var should = require('should');

describe('merge', function () {

    var source = asyncplify.merge([asyncplify.value(0), asyncplify.value(1)]);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [0, 1]);

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
    })
    
    source = asyncplify
        .merge([asyncplify.value(0), asyncplify.interval(1)]);
    
    common.itShouldClose(source, 'should not throw on closing in child item');
})
