import { MongoClient } from 'mongodb';

let dbConnection;

export const connectToDb = async (cb) => {
    const client = await MongoClient.connect('mongodb://127.0.0.1:27017/shop')
    try {
        dbConnection = client.db();
        return cb();
    } catch (err) {
        console.log(err);
        return cb(err);
    }
}

export const getDb = () => dbConnection;