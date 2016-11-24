
var Client = require('../build').default
	, assert = require('assert')
	;

var Rambase = require('./helpers/redis-mock')
function uuid(id) { return (id.toString()+(Math.random())); }



describe('# Test with promises', function(){
	var key = uuid('key');
	var _value="Value";
	var _prefix='TestPfx';
	var client1 = new Client({redisRead:Rambase, redisWrite:Rambase, ttl:1, prefix:_prefix})

	describe('=> Utils', function(){
		it('buildKey(key):Equal test', function(){
			assert.equal(client1.buildKey('key1'), client1.opts.prefix ? (_prefix+':key1'): 'key1');
		})
		it('buildKey(key):Not equal test', function(){
			assert.notEqual(client1.buildKey('key1'), client1.opts.prefix ? (_prefix+':key2'): 'key2');
		})
		it('Stringify(value)', function(){
			assert.equal(client1.Stringify({test:123}), '{"test":123}');
		})
		it('typeOf(value)', function(){
			assert.equal(client1.typeOf(123), "Number");
			assert.equal(client1.typeOf('abc'), "String");
			assert.equal(client1.typeOf({test:123}), "Object");
		})

	})
	
	
	describe('=> setItem(key, value, overwrite, ?callback)', function(){
		
		
		it('Should set without any error', function (done) {
			client1.setItem(key, _value).then((setResp)=>{
				assert.deepEqual(setResp, [[null, 'OK'], [null, 1]]);
				done();
			}).catch(done)
		})

		it('Should be alive', function (done) {
			client1.isAlive(key).then((age)=>{
				assert.equal(age, client1.opts.ttl);
				done();
			}).catch(done)
		})

		it('Should be real value', function (done) {
			client1.getItem(key).then((value)=>{
				assert.deepEqual(value, _value);
				done();
			}).catch(done)
		})

		it('Should reject overwrite', function (done) {
			client1.setItem(key, _value)
			.then(()=>{
				return done(new Error('Overwrite must throw an error'))
			})
			.catch(function (err) {
				assert.equal(err.toString(), 'Error: Value already exist');
				done()
			})
		})

		it('Should accept overwrite', function (done) {
			client1.setItem(key, _value, true)
			.then((setResp)=>{
				assert.deepEqual(setResp, [[null, 'OK'], [null, 1]]);
				done();
			})
			.catch(done)
		})

		it('Should remove item', function (done) {
			var key2 = key+2;

			client1.setItem(key2, _value, true)
			.then((setResp)=>{
				return client1.removeItem(key2)
			})
			.then((setResp)=>{
				return client1.getItem(key2)
			})
			.then((valResp)=>{
				assert.equal(valResp,null);
				done();
			})
			.catch(done)
		})


		it('Should be expired', function (done) {
			var _timeout = (client1.opts.ttl+1)*1000/*sec => ms*/

			this.timeout(_timeout+100);
			setTimeout(function(){
				client1.getItem(key)
				.then(function (val) {
					assert.equal(val, null); done();
				}).catch(done);
			}, _timeout);
		})

	})

})
