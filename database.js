import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';
const mongoDB = new MongoClient(process.env.mongoConnectionStr, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const whichDatabase = process.env.isDev == "yes" ? "takepoint-dev" : "takepoint";
const db = mongoDB.db(whichDatabase);

const collections = {
    reservedUsers: db.collection("reservedUsers"),
    players: db.collection("players"),
    sessions: db.collection("sessions"),
    games: db.collection("games")
};

module.exports = collections;