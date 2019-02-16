const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, wallet, recipient, amount;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 50;
        recipient = 'r3c1p13nt';
        transaction = Transaction.newTransaction(wallet, recipient, amount);

    });

    it('outputs the `amount` subtracted from the wallet', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
            .toEqual(wallet.balance - amount);
    });

    it('outputs the `amount` added to the recipient', () => {
        expect(transaction.outputs.find(output => output.address === recipient).amount)
            .toEqual(amount);
    });
    it('', () => {

        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validates transaction', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidates invalid transactions', () => {
        transaction.outputs[0].amount = 50000;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    })
    describe('updating wallet', () => {
        let nextRecipient, nextAmount;
        beforeEach(() => {
            nextAmount = 20;
            nextRecipient = 'nxt-assa';
            transaction = transaction.update(wallet, nextRecipient, nextAmount);
        });
        it(`substracts the  next amount`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - amount - nextAmount);
        });

        it('outputs the amount for recipient', () => {
            expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
                .toEqual(nextAmount);

        });

    });

    describe('creating reward transaction', () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
        });

        it(`miners reward testing`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD);
        });
    });
});