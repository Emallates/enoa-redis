'use strict';

import safeStringify from "json-stringify-safe"

export default class RedisManager {
	
	constructor(options={overwriteAll:false, prefix:false}){
		this.opts = options;
		this.redisWrite = this.opts.redisWrite;
		this.redisRead = this.opts.redisRead || this.opts.redisWrite;
	}

	resProm(Prms, callback/*, sync=false*/){
		return (this.typeOf(callback) === 'Function') ? Prms.then((value)=>{callback(null, value)}).catch(callback) : Prms ;
	}

	setItem(key, value, overwrite, callback){
		if(this.typeOf(overwrite) == 'Function'){ callback=overwrite; overwrite=false; }
		let _self = this;

		return _self.getItem(key)
		.then(function valFound(val) {
			if(val === null || _self.opts.overwriteAll || overwrite) return;
			if(!callback) throw new Error('Value already exist');
			else return callback(new Error('Value already exist'))
		})
		.then(function setValue(){
			key = _self.opts.prefix ? `${_self.opts.prefix}:${key}` : key;
			value = _self.Stringify(value);
			console.log('value', value);
			return _self.resProm(_self.redisRead.set(key, value), callback);
		})
		
	}

	getItem(key, callback){
		key = this.opts.prefix ? `${this.opts.prefix}:${key}` : key;
		return this.resProm(this.redisRead.get(key), callback);
	}

	removeItem(key, callback){
		key = this.opts.prefix ? `${this.opts.prefix}:${key}` : key;
		return this.resProm(this.redisRead.del(key), callback);
	}

	Stringify(val){
		return safeStringify(val);
	}
	// Parse(val){
	// 	return JSON.parse(val);
	// }
	typeOf(val){
		return Object.prototype.toString.call(val).replace(/\[object |\]/g, '');
	}

}