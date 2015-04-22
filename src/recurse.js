/*Flow.prototype.recurse = function (options) {
    var produce = options.produce;
    var feedback = options.feedback;
    var self = this;

    return new Flow(function (subscriber) {
        var subscriptions = [];
        var paused = subscriber.paused;

        function subscribeFeedback(item) {
            var s = item.subscription({
                emit: function (v) {
                    var t = produce(v);
                    t && t.subscription && subscribeProduce(t);
                },
                end: function (err) {
                    endSubscribe(subscriptions, s, subscriber, err);
                },
                paused: true
            });

            subscriptions.push(s);
            !paused && s.resume();
        }

        function subscribeProduce(item) {
            var s = item.subscription({
                emit: function (v) {
                    if (v != undefined) {
                        subscriber.emit(v);
                        var t = feedback(v);
                        t && t.subscription && subscribeFeedback(t);
                    }
                },
                end: function (err) {
                    endSubscribe(subscriptions, s, subscriber, err);
                },
                paused: true
            });

            subscriptions.push(s);
            !paused && s.resume();
        }

        !paused && subscribeFeedback(self);

        return {
            close: function () {
                closeSubscriptions(subscriptions);
            },
            pause: function () {
                paused = true;
                pauseSubscriptions(subscriptions);
            },
            resume: function () {
                paused = false;
                resumeSubscriptions(subscriptions);
            }
        }
    });
};
*/
