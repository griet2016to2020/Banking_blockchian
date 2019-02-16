const WebSocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions:'CLEAR_TRANSACTIONS'
}
class P2pserver {

    constructor(blockchain,transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectsocket(socket));
        this.connecttopeers();
        console.log(`listening to peer to peer connections at port${P2P_PORT}`);

    }

    connecttopeers() {
        peers.forEach(peer => {
            const socket = new WebSocket(peer);
            socket.on('open', () => this.connectsocket(socket));
        });
    }

    connectsocket(socket) {

        this.sockets.push(socket);
        console.log('socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
    }
    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;

            }
           
        });
    }
    sendChain(socket) {
        socket.send(JSON.stringify(
            {
                type: MESSAGE_TYPES.chain,
                chain: this.blockchain.chain
            }));
    }
    syncChains() {
        this.sockets.forEach(socket => { this.sendChain(socket) });
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    sendTransaction(socket,transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    broadcastClearTransactions() {

        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }

}
module.exports = P2pserver;