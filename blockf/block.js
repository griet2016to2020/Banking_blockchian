
const ChainUtil = require('../chain-util/chain-util');

const { DIFFICULTY, MINE_RATE } = require('../config');
class Block
{
constructor(timestamp, hash, lastHash, data,nonce,difficulty)
{
this.timestamp=timestamp;
this.hash=hash;
this.lastHash=lastHash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
}

toString()
{
return `Block
	Timestamp: ${this.timestamp}
	Hash: ${this.hash}
    Nonce:${this.nonce}
    Difficulty:${this.difficulty}
	LastHash: ${this.lastHash}
	Data:${this.data}`
}

static genesis()
{
    return new this('jk', '01ttk', '----', [], 0, DIFFICULTY);
}
static mineBlock(lastBlock,data)
{

    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let hash,timestamp;
    let nonce = 0;
    do {
        nonce++;
        timestamp = Date.now();
        difficulty = Block.adjustDifficulty(lastBlock, timestamp);
        hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));
    return new this(timestamp, hash, lastHash, data, nonce, difficulty);

}

static hash(timestamp,lastHash,data,nonce,difficulty)
{
    return ChainUtil.hash(`${timestamp},${lastHash},${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty;
    }

}
module.exports=Block;
