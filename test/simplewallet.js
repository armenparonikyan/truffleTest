var SimpleWallet = artifacts.require("./SimpleWallet.sol");

contract('SimpleWallet', function(accounts){
	it('the owner is allowed to send funds', function(){
		return SimpleWallet.deployed().then(instance => {
			return instance.isAllowedToSend.call(accounts[0]).then(isAllowed => {
				assert.equal(isAllowed, true, 'The author should be allowed');
			});
		});
	});

	it('Another account is not allowed', function(){
		return SimpleWallet.deployed().then(instance => {
			return instance.isAllowedToSend.call(accounts[1]).then(isAllowed => {
				assert.equal(isAllowed, false, 'The account should not be allowed');
			});
		});
	});

	it('Can we change permissions', function(){
		return SimpleWallet.deployed().then(instance => {
			return instance.isAllowedToSend.call(accounts[1]).then(isAllowed => {
				assert.equal(isAllowed, false, 'The account should not be allowed');
			}).then(()=>{
				return instance.allowToSend(accounts[1]);
			}).then(()=>{
				return instance.isAllowedToSend.call(accounts[1]);
			}).then(isAllowed => {
				assert.equal(isAllowed, true, 'The account should be allowed');
			}).then(()=>{
				return instance.disallowToSend(accounts[1]);
			}).then(()=>{
				return instance.isAllowedToSend.call(accounts[1]);
			}).then(isAllowed => {
				assert.equal(isAllowed, false, 'The account should not be allowed');
			});
		});
	});

	it('The deposit event is working', function(done){
		SimpleWallet.deployed().then(instance => {
			const events = instance.allEvents();

			events.watch(function(err, result){
				if(err){
					console.log(err);
				} else {
					assert.equal(result.event, 'Deposit');
					assert.equal(web3.fromWei(result.args.amount.valueOf(), 'ether'), 1);
					events.stopWatching();
					done();
				}
			});
			web3.eth.sendTransaction({from:web3.eth.accounts[0], to: instance.address, value:web3.toWei(1, 'ether')});
		});
	});


	it('should throw an error when not allowed user deposits', function(done){
		SimpleWallet.deployed().then(instance => {
			web3.eth.sendTransaction({from:web3.eth.accounts[1], to: instance.address, value:web3.toWei(1, 'ether')}, (err, result)=>{
				if(err) {
					done();
				} else {
					done(result);
				}
			});
		});
	});

	it('Withdrawal event is working', function(done){
		SimpleWallet.deployed().then(instance => {
			const events = instance.allEvents({event:"Withdrawal"},{fromBlock: 0, toBlock: 'latest'});

			events.watch(function(err, result){
				if(err){
					console.log(err);
				} else {
					console.log(result);
					if(result.event !== "Deposit"){
						events.stopWatching();
						done();
					}
				}
			});

			web3.eth.sendTransaction({from:web3.eth.accounts[0], to: instance.address, value:web3.toWei(1, 'ether')});
			instance.sendFunds(accounts[1], web3.toWei(1, 'ether')).then((err, result)=>{
				console.log('armen');
				console.log(err);
				console.log(result);
			});
		});
	});
});
