'use strict';

import safeStringify from "json-stringify-safe"

export default class RedisManager {
	
	constructor(options={overwriteAll:false, prefix:false}){
		this.opts = options;
		this.opts.ttl = this.opts.timeout || this.opts.expire || this.opts.ttl;

		this.redisWrite = this.opts.redisWrite;
		this.redisRead = this.opts.redisRead || this.opts.redisWrite;
	}

	buildKey(key){
		if(!this.opts.prefix || (key||'').toString().indexOf(this.opts.prefix) !== -1) return key;
		return `${this.opts.prefix}:${key}`; 
	}
	
	setItem(key, value, overwrite, callback){
		if(this.typeOf(overwrite) == 'Function'){ callback=overwrite; overwrite=false; }
		let _self = this;

		return _self.getItem(key)
		.then(function valFound(val) {
			if(val === null || _self.opts.overwriteAll || overwrite) return;
			throw new Error('Value already exist');			
		})
		.then(function setValue(){
			key = _self.buildKey(key);
			value = _self.Stringify(value);
			let _SET = _self.redisWrite.pipeline().set(key, value);
			if( typeof _self.opts.ttl == 'number' ) _SET.expire(key, _self.opts.ttl)
			return _SET.exec()
		})
		.nodeify(callback)
		
	}

	getItem(key, callback){
		key = this.buildKey(key);
		return this.redisRead.get(key).then((val)=>{ return val ? JSON.parse(val) : null }).nodeify(callback);
	}

	isAlive(key, callback){
		key = this.buildKey(key);
		return this.redisRead.ttl(key).nodeify(callback);
	}

	removeItem(key, callback){
		key = this.buildKey(key);
		this.redisWrite.del(key)
		.then( (val) => { return (val !== null) ? JSON.parse( val ) : val; } )
		.nodeify(callback);
	}

	Stringify(val){
		return safeStringify(val);
	}

	typeOf(val){
		return Object.prototype.toString.call(val).replace(/\[object |\]/g, '');
	}


}