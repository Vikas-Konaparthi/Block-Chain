const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

    const bc1={
    "chain": [
    {
    "index": 1,
    "timeStamp": 1619498639736,
    "transaction": [],
    "nonce": 100,
    "hash": "0",
    "previousHashBlock": "0"
    },
    {
    "index": 2,
    "timeStamp": 1619498650301,
    "transaction": [],
    "nonce": 18140,
    "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    "previousHashBlock": "0"
    },
    {
    "index": 3,
    "timeStamp": 1619498719888,
    "transaction": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "2edc7870a71311ebb4e0a54bddfa13f7",
    "transcationId": "352fbbb0a71311ebb4e0a54bddfa13f7"
    },
    {
    "amount": 10,
    "sender": "JKNJSDNCJNSCNASJ",
    "recipient": "KJNDKSADSJKSA",
    "transcationId": "3a597310a71311ebb4e0a54bddfa13f7"
    },
    {
    "amount": 30,
    "sender": "JKNJSDNCJNSCNASJ",
    "recipient": "KJNDKSADSJKSA",
    "transcationId": "3d4a0350a71311ebb4e0a54bddfa13f7"
    }
    ],
    "nonce": 48968,
    "hash": "00005445e467ef685935becf9c497d77361ad2154f15500a977b6008a7495e1e",
    "previousHashBlock": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
    "index": 4,
    "timeStamp": 1619498756397,
    "transaction": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "2edc7870a71311ebb4e0a54bddfa13f7",
    "transcationId": "5ea34e30a71311ebb4e0a54bddfa13f7"
    },
    {
    "amount": 40,
    "sender": "JKNJSDNCJNSCNASJ",
    "recipient": "KJNDKSADSJKSA",
    "transcationId": "660457f0a71311ebb4e0a54bddfa13f7"
    },
    {
    "amount": 50,
    "sender": "JKNJSDNCJNSCNASJ",
    "recipient": "KJNDKSADSJKSA",
    "transcationId": "6846cde0a71311ebb4e0a54bddfa13f7"
    },
    {
    "amount": 60,
    "sender": "JKNJSDNCJNSCNASJ",
    "recipient": "KJNDKSADSJKSA",
    "transcationId": "6b371000a71311ebb4e0a54bddfa13f7"
    },
    {
    "amount": 70,
    "sender": "JKNJSDNCJNSCNASJ",
    "recipient": "KJNDKSADSJKSA",
    "transcationId": "6d84a980a71311ebb4e0a54bddfa13f7"
    }
    ],
    "nonce": 203972,
    "hash": "0000ace460f23b8be9eb0fa69b91f11555e9bafe23fed5bac1076fd979b9cfa3",
    "previousHashBlock": "00005445e467ef685935becf9c497d77361ad2154f15500a977b6008a7495e1e"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "2edc7870a71311ebb4e0a54bddfa13f7",
    "transcationId": "746845e0a71311ebb4e0a54bddfa13f7"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
    };


    console.log('Valid:',bitcoin.chainIsValid(bc1.chain));