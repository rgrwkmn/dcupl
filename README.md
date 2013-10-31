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

Requires the same arguments as subscribing. Pass the event and the function.
``` javascript
var dcupl = require('dcupl');

var doorOpenLogger = function() {
    console.log('Someone opened the door.');
}

dcupl.subscribe('doorOpen', doorOpenLogger);
dcupl.publish('doorOpen'); // calls doorOpenLogger
dcupl.unsubscribe('doorOpen', doorOpenLogger);
dcupl.publish('doorOpen'); // doesn't call doorOpenLogger
```

Event Hierarchy

You can namespace your events with a namespace character which is `.` by default and can be configured with `dcupl.namespacer`. This creates an event hierarchy where any published event will bubble up its namespaces.

``` javascript
var dcupl = require('dcupl');

var doorLogger = function() {
    console.log('Something just happened with the door');
}
var doorOpenLogger = function() {
    console.log('Someone opened the door.');
}

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
}

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
}
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

var door = function(name) {
    this.name = name || this.name;
    dcupl.publish('door.new.'+name, this.name, this.doorState);
};

door.prototype = {
    name: 'generic',
    state: 'new',
    installationFee: 0.65,
    install: function() {
        this.doorState = 'closed';
        dcupl.publish('door.install.'+name, this.name, this.doorState, this.installationFee);
    },
    open: function() {
        this.doorState = 'open';
        dcupl.publish('door.open.'+name, this.name, this.doorState);
    },
    close: function() {
        this.doorState = 'closed';
        dcupl.publish('door.close.'+name, this.name, this.doorState);
    },
    install: function() {
        this.doorState = 'closed';
        dcupl.publish('door.install.'+name, this.name, this.doorState, this.installationFee);
    }
};

var doorLogger = function(name, doorState) {
    console.log('Something just happened with the '+name+' door and now it is '+doorState);
}
var doorNewLogger = function(name, doorState) {
    console.log('Look, a new '+name+' door!');
}
var doorOpenLogger = function(name) {
    console.log('Someone opened the '+name+' door.');
}
var doorCloseLogger = function(name) {
    console.log('Someone closed the '+name+' door.');
}
var doorInstallLogger = function(name, doorState, installationFee) {
    console.log('The '+name+' door was installed and it cost '+installationFee+' BTC.');
}
// only subscribes to closet door events
var closetDoorOpenLogger = function(name, doorState) {
    console.log('A closet door was opened!');
}
dcupl.subscribe('door', doorLogger);
dcupl.subscribe('door.new', doorNewLogger);
dcupl.subscribe('door.open', doorOpenLogger);
dcupl.subscribe('door.close', doorCloseLogger);
dcupl.subscribe('door.open.closet', closetDoorOpenLogger);
dcupl.subscribe('door.install', doorInstallLogger, true);

var myNewClosetDoor = new Door('closet');
myNewClosetDoor.install();
myNewClosetDoor.open();
myNewClosetDoor.close();

```
