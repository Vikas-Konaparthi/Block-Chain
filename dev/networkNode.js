const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const {v1: uuidv1} = require('uuid');
const port = process.argv[2];
const rp = require('request-promise');


const nodeAddress = uuidv1().split("-").join("");

const caticoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
 
app.get('/blockchain', function (req, res) {
    res.send(caticoin);
});


app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex =caticoin.addTransactionToPendingTransaction(newTransaction);
    res.json({note:`Transaction will be added to the block ${blockIndex}`});
});
app.post('/transaction/broadcast', function (req, res) {
    const newTransaction = caticoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    caticoin.addTransactionToPendingTransaction(newTransaction);
    const requestPromises =[];
    caticoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions ={
            uri: networkNodeUrl +'/transaction',
            method:"POST",
            body:newTransaction,
            json:true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data=>{
        res.json({note:"Transaction created and broadcasted successfully."});
    })
});

app.get('/mine', function(req, res) {
	const lastBlock = caticoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: caticoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = caticoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = caticoin.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = caticoin.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	caticoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: caticoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});
});

app.post('/register-and-broadcast-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    if(caticoin.networkNodes.indexOf(newNodeUrl)==-1)caticoin.networkNodes.push(newNodeUrl);

    const regNodesPromises=[];
    caticoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions ={
            uri: networkNodeUrl +'/register-node',
            method:"POST",
            body:{newNodeUrl:newNodeUrl},
            json:true
        };
        regNodesPromises.push(rp(requestOptions));
    });
    Promise.all(regNodesPromises)
    .then(data=>{
        const bulkRegistrationOptions ={
            url: newNodeUrl +"/register-nodes-bulk",
            method:"POST",
            body:{allNetworkNodes:[...caticoin.networkNodes,caticoin.currentNodeUrl]},
            json:true,
        };
        return rp(bulkRegistrationOptions);
    }).then(data =>{
        res.json({note:"New node registered with the network successfully."})
    })
})
app.post('/register-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = caticoin.networkNodes.indexOf(newNodeUrl)==-1;
    const notCurrentNode = caticoin.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode) caticoin.networkNodes.push(newNodeUrl);
    res.json({note:"New node registered successfully with the node."})

})
app.post('/register-nodes-bulk',function(req,res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(newNodeUrl=>{
        const nodeNotAlreadyPresent = caticoin.networkNodes.indexOf(newNodeUrl)==-1;
        const notCurrentNode = caticoin.currentNodeUrl !== newNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) caticoin.networkNodes.push(newNodeUrl);
    })

    return res.json({note:"Bulk registration successful."})
    
})

app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = caticoin.getLastBlock();
	const correctHash = lastBlock['hash'] === newBlock.previousHashBlock; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    console.log(lastBlock.hash)
    console.log(correctIndex,correctHash)
	if (correctHash && correctIndex) {
        console.log(correctIndex,correctHash)
		caticoin.chain.push(newBlock);
		caticoin.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});
app.get("/consensus",function(req,res){
    const requestPromises =[];
    caticoin.networkNodes.forEach(networkNodeUrl=>{
        
        const requestOptions ={
            uri:networkNodeUrl+"/blockchain",
            method:"GET",
            json:true
        }
        requestPromises.push(rp(requestOptions));

    });
    Promise.all(requestPromises)
    .then(blockchains=>{
        const currentChainLength = caticoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(blockchain=>{
            if(blockchain.chain.length > maxChainLength)
            {
                maxChainLength = blockchain.chain.length;
                newLongChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            }
        });
        if(!newLongChain || (newLongChain && !caticoin.chainIsValid(newLongChain))){
            res.json({
                note:'Current chain has not beeen replaced',
                chain: caticoin.chain
            })
        }else {
            caticoin.chain = newLongChain;
            caticoin.pendingTransactions = newPendingTransactions;

            res.json({
                note:"This chain has been replaced",
                chain:caticoin.chain
            })

        }
    })
})

app.get("/block/:blockHash", function(req,res){
    const blockHash = req.params.blockHash;
    const correctBlock= caticoin.getBlock(blockHash);
    res.json({block:correctBlock})

})
app.get("/transaction/:transactionId", function(req,res){
    const transactionId = req.params.transactionId;
    const transactionData = caticoin.getTransaction(transactionId);

    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    })
})
app.get("/address/:address", function(req,res){
    const address = req.params.address;
    const addressData =caticoin.getAddressData(address);

    res.json({
        addressData:addressData
    })

    
})

app.get('/block-explorer', function(req, res) {
	res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port,function(){
    console.log(`Server running on ${port}`);
})