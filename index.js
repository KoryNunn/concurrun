module.exports = function(rate){
    if(typeof rate !== 'function' && (typeof rate !== 'number' || isNaN(rate))){
        throw 'Rate must be a number or CPS function, got ' + rate;
    }

    var getRate = typeof rate === 'function' ? rate : function(info, callback){
        callback(null, rate);
    };

    var queued = [];
    var inFlight = 0;
    var complete = 0;
    var succeeded = 0;

    function runNext(){
        getRate({
                inFlight,
                complete,
                succeeded
            },
            function(error, currentRate){
                if(error){
                    return queued.shift()(error);
                }

                if(inFlight < currentRate && queued.length){
                    inFlight++;
                    queued.shift()();
                    runNext();
                }
            }
        );
    }

    return function(task){
        return function(){
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();

            queued.push(function(rateError){
                if(rateError){
                    return callback(rateError);
                }

                task.apply(null, args.concat(function(error){
                    callback.apply(null, arguments);
                    inFlight--;
                    complete++;
                    if(!error){
                        succeeded++;
                    }
                    runNext();
                }));
            });

            runNext();
        };
    };
};