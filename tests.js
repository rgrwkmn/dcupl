var dcupl = require('./dcupl.js');

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