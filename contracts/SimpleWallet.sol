pragma solidity ^0.4.15;

contract SimpleWallet {
	address owner;
	mapping (address => bool) isAllowedToSendFunds;

	event Deposit(address _sender, uint amount);
	event Withdrawal(address _sender, uint amount, address _beneficiary);


	function SimpleWallet () {
		owner = msg.sender;
	}

	function () payable {
		if (isAllowedToSend(msg.sender)) {
			Deposit(msg.sender, msg.value);
		} else {
			throw;
		}
	}

	function sendFunds(address receiver, uint amount) payable returns (uint) {
		if (isAllowedToSend(msg.sender)) {
			if (!receiver.send(amount)) {
				throw;
			}
			Withdrawal(msg.sender, amount, receiver);
			return this.balance;
		}
	}

	function allowToSend(address _user) {
		if(msg.sender == owner){
			isAllowedToSendFunds[_user] = true;
		}
	}

	function disallowToSend(address _user) {
		if(msg.sender == owner){
			isAllowedToSendFunds[_user] = false;
		}
	}

	function isAllowedToSend(address user) returns (bool) {
		return user == owner || isAllowedToSendFunds[user];
	}

	function killWallet() {
		if(msg.sender == owner){
			suicide(owner);
		}
	}
}
