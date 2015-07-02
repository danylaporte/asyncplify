var asyncplify = require('../../dist/asyncplify');
var assert = require('assert');
var should = require('should');

describe('timeoutScheduler', function () {
    it('should call action in the specified relative delay', function (done) {

        var scheduler = asyncplify.schedulers.timeout()
        var startTime = Date.now();

        var item = {
            delay: 15,
            action: function () {
                var delay = new Date() - startTime;
                delay.should.be.approximately(15, 5);
                done();
            },
            error: function (err) {
                assert(false);
            }
        };

        scheduler.schedule(item);
    })

    it('should call action at the specified dueTime', function (done) {

        var scheduler = asyncplify.schedulers.timeout();
        var startTime = Date.now();
        var time = new Date();
        time.setMilliseconds(time.getMilliseconds() + 15);

        var item = {
            action: function () {
                (Date.now() - startTime).should.be.approximately(15, 5);
                done();
            },
            dueTime: time,
            error: function (err) {
                assert(false);
            }
        };

        scheduler.schedule(item);
    })
})
