'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Redis = function () {
	function Redis() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, Redis);

		this._CACHE = {};
		this.opts = options;
	}

	_createClass(Redis, [{
		key: 'setItem',
		value: function setItem(key, value, overwrite) {
			key = this.opts.prefix ? this.opts.prefix + ':' + key : key;
			if (this._CACHE[key] !== undefined && !overwrite) return false;

			this._CACHE[key] = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' ? this.Stringify(value) : value;
			return true;
		}
	}, {
		key: 'getItem',
		value: function getItem(key) {
			key = this.opts.prefix ? this.opts.prefix + ':' + key : key;
			if (this._CACHE[key] === undefined) return;
			return this._CACHE[key];
			return this.Parse(this._CACHE[key]);
		}
	}, {
		key: 'removeItem',
		value: function removeItem(key) {
			key = this.opts.prefix ? this.opts.prefix + ':' + key : key;
			delete this._CACHE[key];
			return true;
		}
	}, {
		key: 'Stringify',
		value: function Stringify(val) {
			return safeStringify(val);
		}
	}, {
		key: 'Parse',
		value: function Parse(val) {
			return JSON.parse(val);
		}
	}, {
		key: 'typeOf',
		value: function typeOf(val) {
			return Object.prototype.toString.call(val).replace(/\[object |\]/g, '');
		}
	}]);

	return Redis;
}();

exports.default = Redis;