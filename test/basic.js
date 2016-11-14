'use strict';

import pkg from "../src"
import Redis from "ioredis"
import fs from "fs"


var rambaseRead = new Redis();
var client = new pkg({redisWrite:rambaseRead})
var key = 'test';
var v = client
	.setItem(key, 'testValue2', true)
	.then(function (value) {
		console.log('Got value', value);
	})
	.then(function(){
		return client.getItem(key);
	})
	.then(function(rbValue){ console.log('Value after SET', rbValue); })
	.then(function(){
		return client.removeItem(key);		
	})
	.then(function (value) {
		console.log('Got DEL result', value);
	})
	.then(function(){
		return client.getItem(key);		
	})
	.then(function (value) {
		console.log('Value after DEL', value);
	})
	.catch(function (err) { console.log('Got err', err); })

// console.log(v);