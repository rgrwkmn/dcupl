dcupl
===
A redundant Pub/Sub implementation featuring publish, subscribe, unsubscribe, argument passing, event hierarchy and latecomer functionality.
___

There are so many implementations just like this out there, I just wanted to do it myself for kicks. I haven't seen latecomer functionality in other implementations although I know it is used in jQuery for DOM ready and onload callbacks and wouldn't be surprised if it is in some pub/subs I haven't seen before.

Examples
---

Basic Example
``` javascript
var dcupl = require('dcupl');

dcupl.subscribe('doorOpen', function() {
    console.log('Someone opened the door.');
});

dcupl.publish('doorOpen'); // calls the subscribed function
```

Unsubscribe

The subscribe method returns a subscription object. Calling the unsubscribe function on the subscription object will remove that subscription's callback from dcupl. This used to be achieved by calling `dcupl.unsubscribe` with the event and the function to unsubscribe but the new method is much more straightforward.
``` javascript
var dcupl = require('dcupl');

var doorOpenLogger = function() {
    console.log('Someone opened the door.');
};

var sub = dcupl.subscribe('doorOpen', doorOpenLogger);
dcupl.publish('doorOpen'); // calls doorOpenLogger
sub.unsubscribe();
dcupl.publish('doorOpen'); // doesn't call doorOpenLogger
```

Event Hierarchy

You can namespace your events with a namespace character which is `.` by default and can be configured with `dcupl.namespacer`. This creates an event hierarchy where any published event will bubble up its namespaces.

``` javascript
var dcupl = require('dcupl');

var doorLogger = function() {
    console.log('Something just happened with the door');
};
var doorOpenLogger = function() {
    console.log('Someone opened the door.');
};

dcupl.subscribe('door', doorLogger);
dcupl.subscribe('door.open', doorOpenLogger);
dcupl.publish('door.open'); // calls doorOpenLogger then doorLogger
```

Latecomer

Let's say there is a one time event that you want to subscribe to and even if it was published before you could subscribe, you still want your callback to fire. You can use the `latecomer` flag in the third argument to subscribe.

``` javascript
var dcupl = require('dcupl');

dcupl.publish('door.install'); // has no subscribers

var doorInstallLogger = function() {
    console.log('The door was installed');
};

// set `latecomer` arg
dcupl.subscribe('door.install', doorInstallLogger, true); // called immediately since door.install was already published
```

Arguments

Passing data from the publisher to the subscribers is really easy. Any arguments defined after the first are passed in order to the subscribed functions.
``` javascript
var dcupl = require('dcupl');

var installationFee = 0.6532505;
dcupl.publish('door.install', installationFee);

var doorInstallLogger = function(installationFee) {
    console.log('The door was installed and it cost '+installationFee+' BTC');
};
dcupl.subscribe('door.install', doorInstallLogger, true); // called immediately with installationFee passed
```

Subscribe the same function to multiple events.

``` javascript
var dcupl = require('dcupl');

dcupl.subscribe('door.open door.close', function() {
    console.log('Someone opened or closed the door.');
});
```

Subscribe multiple functions to the same event.

Subscribed functions are pushed into an array for each event so the first subscribed is the first called. There is no logic to prevent subsequent callbacks from firing or anything like that.

``` javascript
var dcupl = require('dcupl');

dcupl.subscribe('door.open', function() {
    console.log('Called first when the door opens.');
});
dcupl.subscribe('door.open', function() {
    console.log('Called second when the door opens.');
});
```

Big Example

``` javascript
var dcupl = require('dcupl');

var Door = function(name) {
    this.name = name || this.name;
    dcupl.publish('door.new.'+name, this.name, this.doorState);
};

Door.prototype = {
    name: 'generic',
    state: 'new',
    installationFee: 0.65,
    install: function() {
        this.doorState = 'closed';
        dcupl.publish('door.install.'+this.name, this.name, this.doorState, this.installationFee);
    },
    open: function() {
        this.doorState = 'open';
        dcupl.publish('door.open.'+this.name, this.name, this.doorState);
    },
    close: function() {
        this.doorState = 'closed';
        dcupl.publish('door.close.'+this.name, this.name, this.doorState);
    }
};

var doorLogger = function(name, doorState) {
    console.log('Something just happened with a '+name+' door.');
};
var doorNewLogger = function(name, doorState) {
    console.log('Look, a new '+name+' door!');
};
var doorOpenLogger = function(name) {
    console.log('Someone opened a '+name+' door.');
};
var doorCloseLogger = function(name) {
    console.log('Someone closed a '+name+' door.');
};
var doorInstallLogger = function(name, doorState, installationFee) {
    console.log('A '+name+' door was installed and it cost '+installationFee+' BTC.');
};
// only subscribes to closet door events
var closetDoorOpenLogger = function(name, doorState) {
    console.log('A closet door was opened!');
}
var annoyingLog = dcupl.subscribe('door', doorLogger);
dcupl.subscribe('door.new', doorNewLogger);
dcupl.subscribe('door.open', doorOpenLogger);
dcupl.subscribe('door.close', doorCloseLogger);
dcupl.subscribe('door.open.closet', closetDoorOpenLogger);

var myNewClosetDoor = new Door('closet');
annoyingLog.unsubscribe();
myNewClosetDoor.install();
myNewClosetDoor.open();
myNewClosetDoor.close();

dcupl.subscribe('door.install', doorInstallLogger, true);
```

Output of the Big Example
```
Look, a new closet door!
Something just happened with a closet door.
A closet door was opened!
Someone opened a closet door.
Someone closed a closet door.
A closet door was installed and it cost 0.65 BTC.
```

Tests
---
Run the tests.js script with node to run the big example above.
```
node tests.js
```