

const Wallet = require('./index');
const TransactionPool = require('./transaction_pool');
const Blockchain = require('../blockf/blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('wallet', () => {
    let wallet, tp,bc;
    beforeEach(() => {
        wallet = new Wallet();
        tp = new TransactionPool();
        bc = new Blockchain();
    });

    describe('creating a transaction', () => {
        let transaction, sendAmount, recipient;

        beforeEach(() => {
            sendAmount = 50;
            recipient = 'random';
            transaction = wallet.createTransaction(recipient, sendAmount,bc, tp);
        });
        describe('and doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount,bc, tp);
            });

            it('doubles the`sendAmount` subtracted from the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2);
            });

            it('clones the `sendAmount` output for the recipient', () => {
                expect(transaction.outputs.filter(output => output.address === recipient)
                    .map(output => output.amount)).toEqual([sendAmount, sendAmount]);
            });

        });
    });

    describe('calculating a balance', () => {
        let addBalance, repeatAdd, senderWallet;
        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;
            for (let i = 0; i < repeatAdd; i++) {
                senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
            }
            bc.addBlock(tp.transactions);
        });

        it('calcs the balance', () => {
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });

        it('cals for blockchain transactions', () => {
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
        });

        describe('recipient transction', () => {
            let subtractBalance, recipientBalance;
            beforeEach(() => {
                tp.clear();
                subtractBalance = 60;
                recipientBalance = wallet.calculateBalance(bc);
                wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
                bc.addBlock(tp.transactions);
            });

            describe('sender sends transactions', () => {
                beforeEach(() => {
                    tp.clear();
                    senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
                    bc.addBlock(tp.transactions);
                });
                it('cals the recipient balance only', () => {
                    expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
                });
            });
        });

    });
});