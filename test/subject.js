var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');

describe('subject', function(){
    it('should emit event to multiple subscribers', function () {
        var subject = asyncplify.subject();
        var array1 = [];
        var array2 = [];
        var count1 = 0;
        var count2 = 0;

        subject.subscribe({
            emit: function (v) { array1.push(v); },
            end: function (err) {
                assert(err === null);
                count1++;
            }
        });

        subject.subscribe({
            emit: function (v) { array2.push(v); },
            end: function (err) {
                assert(err === null);
                count2++;
            }
        });

        subject.emit(1);
        subject.emit(2);

        array1.should.eql([1, 2]);
        array2.should.eql([1, 2]);

        subject.end(null);

        count1.should.equal(1);
        count2.should.equal(1);
    })
})
