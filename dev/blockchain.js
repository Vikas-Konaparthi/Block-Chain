const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const {v1: uuidv1} = require('uuid');

function Blockchain(){
    this.chain =[];
    this.pendingTransactions =[];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes =[];

    this.createNewBlock(100,'0','0');
}

Blockchain.prototype.createNewBlock = function(nonce,previousHashBlock,hash){
    const newBlock={
        index:this.chain.length+1,
        timeStamp:Date.now(),
        transaction: this.pendingTransactions,
        nonce:nonce,
        hash:hash,
        previousHashBlock:previousHashBlock,
    }

    this.pendingTransactions =[];
    this.chain.push(newBlock);
    return newBlock;
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length-1];
}

Blockchain.prototype.createNewTransaction =function(amount,sender,recipient){
    const newTransaction ={
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId:uuidv1().split("-").join("")
    }

    return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransaction = function(transactionObj){
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index'] +1;

}

Blockchain.prototype.hashBlock = function(previousBlockHash,currentBlockData,nonce){
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return sha256(dataAsString);


}

Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData){
    let nonce =0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);

    while(hash.substring(0,4)!=='0000'){
        nonce++;
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    }

    return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain)
{
    validChain = true;

    for(var i =1; i< blockchain.length ;i++)
    {
        const currentBlock = blockchain[i];
        const previousBlock = blockchain[i-1];
        const blockHash = this.hashBlock(previousBlock['hash'],{ transactions: currentBlock['transaction'],index: currentBlock['index']},currentBlock['nonce'])
        if(blockHash.substring(0,4) !== '0000') validChain = false;
        if(currentBlock['previousHashBlock'] !== previousBlock['hash'])  validChain = false;
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousHashBlock'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transaction'].length ===0;

    if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

    return validChain;
}



Blockchain.prototype.getBlock= function(blockHash){
    let correctBlock = null;
    this.chain.forEach(block=>{
        if(block.hash===blockHash)
        {
            correctBlock = block;
        }
    });
    return correctBlock;
}

Blockchain.prototype.getTransaction= function(transactionId){

    let correctTransaction = null;
    let correctBlock =null;
    this.chain.forEach(block=>{
        block.transaction.forEach(transaction=>{
            console.log("trans",transaction.transactionId, "tran",transactionId)
            if(transaction.transactionId === transactionId) {
                correctTransaction = transaction;
                correctBlock = block;
            }
        })
    });

    return {
        transaction:correctTransaction,
        block:correctBlock
    }

}

Blockchain.prototype.getAddressData = function(address){
    const addressTransactions =[];
    this.chain.forEach(block=>{
        block.transaction.forEach(transaction=>{
            if(transaction.sender === address || transaction.recipient === address)
            {
                addressTransactions.push(transaction);
            }
        })
    });

    let balance =0;

    addressTransactions.forEach(transaction=>{
        if(transaction.recipient === address) balance += transaction.amount;
        else if(transaction.sender === address) balance -= transaction.amount;
    });

    return {
        addressTransactions:addressTransactions,
        addressBalance: balance
    }
}
module.exports = Blockchain;