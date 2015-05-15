var asyncplify = require('../../dist/asyncplify');
var assert = require('assert');
var should = require('should');

describe('timeoutScheduler', function () {
    it('should call action in the specified relative delay', function (done) {

        var scheduler = asyncplify.schedulers.timeout()
        var count = 0;
        var startTime = new Date();

        var item = {
            delay: 15,
            action: function () {
                count++;
                var delay = new Date() - startTime;
                delay.should.be.approximately(15, 5);
            }
        };

        scheduler.itemDone = function (err) {
            if (err) {
                throw err;
            }

            assert(err === null);
            count.should.equal(1);
            done();
        }

        scheduler.schedule(item);
    })

    it('should call action at the specified dueTime', function (done) {

        var scheduler = asyncplify.schedulers.timeout();
        var count = 0;
        var init = new Date();
        var time = new Date();
        time.setMilliseconds(time.getMilliseconds() + 15);

        var item = {
            action: function () {
                count++;
                var delay = new Date() - init;
                delay.should.be.approximately(15, 5);
            },
            dueTime: time
        };

        scheduler.itemDone = function (err) {
            if (err) {
                throw err;
            }
            assert(err === null);
            count.should.equal(1);
            done();
        }

        scheduler.schedule(item);
    })
})
