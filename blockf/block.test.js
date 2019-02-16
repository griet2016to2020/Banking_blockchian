const Block = require('./block');
const { DIFFICULTY, MINE_RATE } = require('../config');
describe('Block', () => {
  let data,lastBlock,block;
 beforeEach( () => {
	data='sdf';
	lastBlock=Block.genesis();
	block=Block.mineBlock(lastBlock,data);
     });

it('sets `data` to match the input',() => {
	expect(block.data).toEqual('sdf');
});
it('sets the  `lastHash` to match the hash of last block',() => {
	expect(block.lastHash).toEqual('01ttk');
});
    it('generates a hash according to the difficulty value', () => {
        
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
        console.log(block.toString());
    });

    it('to lessen the difficulty', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(block.difficulty - 1);
    });

    it('to increase the difficulty', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(block.difficulty +1);
    });
});