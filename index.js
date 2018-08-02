module.exports = function(rate){
    if(typeof rate !== 'number' || isNaN(rate)){
        throw 'Rate must be a number, got ' + rate;
    }

    var queued = [];
    var inFlight = 0;

    function runNext(){
        if(inFlight < rate && queued.length){
            inFlight++;
            queued.shift()();
        }
    }

    return function(task){
        return function(){
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();

            queued.push(function(){
                task.apply(null, args.concat(function(){
                    callback.apply(null, arguments);
                    inFlight--;
                    runNext();
                }));
            });

            runNext();
        };
    };
};