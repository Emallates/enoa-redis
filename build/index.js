'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonStringifySafe = require('json-stringify-safe');

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RedisManager = function () {
	function RedisManager() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { overwriteAll: false, prefix: false };

		_classCallCheck(this, RedisManager);

		this.opts = options;
		this.opts.ttl = this.opts.timeout || this.opts.expire || this.opts.ttl;

		this.redisWrite = this.opts.redisWrite;
		this.redisRead = this.opts.redisRead || this.opts.redisWrite;
	}

	_createClass(RedisManager, [{
		key: 'buildKey',
		value: function buildKey(key) {
			if (!this.opts.prefix || (key || '').toString().indexOf(this.opts.prefix) !== -1) return key;
			return this.opts.prefix + ':' + key;
		}
	}, {
		key: 'setItem',
		value: function setItem(key, value, overwrite, callback) {
			if (this.typeOf(overwrite) == 'Function') {
				callback = overwrite;overwrite = false;
			}
			var _self = this;

			return _self.getItem(key).then(function valFound(val) {
				if (val === null || _self.opts.overwriteAll || overwrite) return;
				throw new Error('Value already exist');
			}).then(function setValue() {
				key = _self.buildKey(key);
				value = _self.Stringify(value);
				var _SET = _self.redisWrite.pipeline().set(key, value);
				if (typeof _self.opts.ttl == 'number') _SET.expire(key, _self.opts.ttl);
				return _SET.exec();
			}).nodeify(callback);
		}
	}, {
		key: 'getItem',
		value: function getItem(key, callback) {
			key = this.buildKey(key);
			return this.redisRead.get(key).then(function (val) {
				return val ? JSON.parse(val) : null;
			}).nodeify(callback);
		}
	}, {
		key: 'isAlive',
		value: function isAlive(key, callback) {
			key = this.buildKey(key);
			return this.redisRead.ttl(key).nodeify(callback);
		}
	}, {
		key: 'removeItem',
		value: function removeItem(key, callback) {
			key = this.buildKey(key);
			this.redisWrite.del(key).then(function (val) {
				return val !== null ? JSON.parse(val) : val;
			}).nodeify(callback);
		}
	}, {
		key: 'Stringify',
		value: function Stringify(val) {
			return (0, _jsonStringifySafe2.default)(val);
		}
	}, {
		key: 'typeOf',
		value: function typeOf(val) {
			return Object.prototype.toString.call(val).replace(/\[object |\]/g, '');
		}
	}]);

	return RedisManager;
}();

exports.default = RedisManager;