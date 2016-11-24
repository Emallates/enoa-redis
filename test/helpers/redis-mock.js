var Q = require('q');
var timer = require('./timer')

var _DB={
	LISTS:{},
	_TIMERS:{}
};

var Redis = {
	_DB:_DB,
	rpush:function (key, value, callback){
		_DB.LISTS[key] = _DB.LISTS[key] || [];
		_DB.LISTS[key].push(value);
		return Q.resolve(_DB.LISTS[key].length).nodeify(callback);
	},

	lindex:function (key, index, callback){
		_DB.LISTS[key] = _DB.LISTS[key] || [];
		index = index || 0;
		return Q.resolve(_DB.LISTS[key][index]).nodeify(callback);
	},

	lpop:function (key, callback){
		_DB.LISTS[key] = _DB.LISTS[key] || [];
		return Q.resolve(_DB.LISTS[key].shift()).nodeify(callback);
	},

	llen:function (key, callback){
		_DB.LISTS[key] = _DB.LISTS[key] || [];
		return Q.resolve(_DB.LISTS[key].length).nodeify(callback);
	},

	del:function (key, callback) {
		var _ret = _DB[key] === undefined ? 0 : 1;
		delete _DB[key];
		return Q.resolve(_ret).nodeify(callback);
	},

	set:function (key, value, callback) {
		_DB[key] = value;
		return Q.resolve('OK').nodeify(callback);
	},
	get:function (key, callback) {
		return Q.resolve(_DB[key]).nodeify(callback);
	},

	ttl:function (key, callback) {
		var age = -1;
		if(_DB._TIMERS[key]) age = _DB._TIMERS[key].getTimeLeft();
		return Q.resolve(age).nodeify(callback);
	},

	expire:function (key, timeout, callback) {
		if(_DB._TIMERS[key]) _DB._TIMERS[key].destroy();
		_DB._TIMERS[key] = new timer(function(){
			Redis.del(key);
			_DB._TIMERS[key].destroy(); delete _DB._TIMERS[key];
		}, timeout)
		return Q.resolve(1).nodeify(callback);
	},

	pipeline:function(){
		return new Pipeline();
	}
}

function Pipeline() {
	
	var cmds = [];
	var _this = this;
	
	_this.set = function(key, value, callback){
		cmds.push(Redis.set(key, value, callback))
		return _this;
	}
	_this.get = function(key, callback){
		cmds.push(Redis.get(key, callback))
		return _this;
	}
	_this.del = function(key, callback){
		cmds.push(Redis.del(key, callback))
		return _this;
	}
	_this.expire = function(key, value, callback){
		cmds.push(Redis.expire(key, value, callback))
		return _this;
	}
	_this.exec = function (callback) {
		return Q.all(cmds).then(function(respArr){ return respArr.map(function(resItr){return [null, resItr]}) }).nodeify(callback)
	}
	
}

module.exports = Redis;