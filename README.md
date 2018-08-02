# concurrun

Limit the number of concurrent executions of a CPS function

## Why does this package have an average name?

https://twitter.com/KoryNunn/status/1024832220467347456

## Usage

``` javascript
// Require / setup
var concurrencyLimit = require('concurrun');

var tenAtATime = concurrencyLimit(10);

// Wrap a function

var limitedReadFile = tenAtATime(fs.readFile);

// Call the wrapped function however you want:

for(var i = 0; i < 100; i++){
    limitedReadFile('myFilePath.txt', 'utf8', function(error, file){

    })
}

```

## Dynamic limit

You can pass a CPS function in place of the limit to dynamically return a limit:

``` javascript

// Ramp up over time
var limit = concurrencyLimit(function(info, callback){
    /*
        info === {
            inFlight: Number of tasks currently in flight
            succeeded: Number of tasks that have completed without error
            complete: Number of tasks that have completed
        }
    */

    // Allow N in flight where N is the number of tasks that have previously finished.
    callback(null, Math.max(info.complete, 1));
});
```