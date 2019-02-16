const Transactionpool = require('./transaction_pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockf/blockchain');

describe('TransactionPool', () => {
    let tp, wallet, transaction,bc;
    beforeEach(() => {
        tp = new Transactionpool();
        wallet = new Wallet();
        bc = new Blockchain();
        /*transaction = Transaction.newTransaction(wallet, 'r4', 30);
        tp.updateOrAddTransaction(transaction);*/
        transaction = wallet.createTransaction('r4', 30,bc, tp);
    });

    it('adds a transaction toa transaction pool', () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);

    });

    it('updates a transaction in pool', () => {

        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'foo', 40);
        tp.updateOrAddTransaction(newTransaction);
        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
            .not.toEqual(oldTransaction);
    });

    it('clear', () => {
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });
    describe('mixing', () => {
        let validTransactions;
        beforeEach(() => {
            validTransactions = [...tp.transactions];
            for (let i = 0; i < 6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('r4', 30,bc, tp);
                if (i % 2 == 0) {
                    transaction.input.amount = 9999;
                } else {
                    validTransactions.push(transaction);
                }
            }

        });
        it('shows a diffrence between valid and corrupt transaction', () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs a valid transactions', () => {
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });
});