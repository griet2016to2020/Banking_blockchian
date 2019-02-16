const express = require('express');
const Blockchain = require('../blockf/blockchain');
const bodyparser = require('body-parser');
const P2pServer = require('./peer2peer.js');
const Wallet = require('../wallet/index');
const TransactionPool = require('../wallet/transaction_pool');
const Miner = require('./miner');
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const cors = require('cors');
const basicAuth = require('express-basic-auth');

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASS = process.env.AUTH_PASS;
const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pserver = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pserver);
const urlencodedParser = bodyparser.urlencoded({ extended: true });
var path = require("path");

app.use(cors());
app.use(function(req, res, next) {
    if ('/blockchain.html' !== req.path) {
        next();
    } else {
        app.use(basicAuth({
            users: {AUTH_USER: AUTH_PASS }
        }))
    }
});

app.use(bodyparser.json());
app.use(express.static('public'));
app.get('/block', (req, res) => {
    res.json(bc.chain);
});
app.listen(HTTP_PORT, () => {
    console.log(`listening ro port ${HTTP_PORT}`)
});

app.post('/login', urlencodedParser, function (req, res) {
    const uname = req.body.username;
    const password = req.body.password;
    if (uname === AUTH_USER && password === AUTH_PASS) {
        auth = "Basic " + new Buffer(uname + ":" + password).toString("base64");
        res.header('Authorization', auth);
        res.sendFile(path.join(__dirname+'/../public/fonts.html'));
    }
    else {
        res.send("Invalid Credentials!!! <a href='/'>Click here</a>");
    }
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`new block added ${block.toString()}`);
    p2pserver.syncChains();
    res.redirect('/block');

});

app.get('/transaction', (req, res) => {
    res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    p2pserver.broadcastTransaction(transaction);
    res.redirect('/transaction');
});

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/block');
});

p2pserver.listen();