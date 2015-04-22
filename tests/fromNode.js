var asyncplify = require('../dist/asyncplify');
var assert = require('assert');
var should = require('should');

describe('fromNode', function () {
    it('should return the data', function () {
        var array = [];
        var count = 0;

        asyncplify
            .fromNode(function (cb) { cb(null, 10); })
            .subscribe({
                emit: function (value) {
                    array.push(value);
                },
                end: function (err) {
                    assert(err === null);
                    count++;
                }
            });

        array.should.eql([10]);
        count.should.equal(1);
    })
})
