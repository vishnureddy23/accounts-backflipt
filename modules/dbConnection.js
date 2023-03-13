import { MongoClient } from "mongodb";

let dbConnection;

const connection = {
  connectToDb: (callback) => {
    const uri =
      "mongodb+srv://gujjulavishnuvardhanreddy8179:Vishnu123@cluster0.2nbwswo.mongodb.net/user_management";
    //const uri =
    // "mongodb+srv://bfSuite:backflipt@cluster0.hsvl4jm.mongodb.net/Accounts";
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db();
        return callback();
      })
      .catch((error) => {
        console.error(error);
        return callback(error);
      });
  },
  getDb: () => dbConnection,
};

export default connection;
