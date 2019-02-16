const Wallet = require('../wallet/index');
const Transaction = require('../wallet/transaction');

class Miner {

    constructor(blockchain, transacactionPool, wallet, p2pserver) {
        this.blockchain = blockchain;
        this.transacactionPool = transacactionPool;
        this.p2pserver = p2pserver;
        this.wallet = wallet;

    }

    mine() {
        const validTransactions = this.transacactionPool.validTransactions();
        //include a reward for the miner
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        );
        const block = this.blockchain.addBlock(validTransactions);
        this.p2pserver.syncChains();
        this.transacactionPool.clear();
        this.p2pserver.broadcastClearTransactions();

        return block;
    }


}
module.exports = Miner;