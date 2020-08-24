var admin = require("firebase-admin");

var serviceAccount = require("../sync-stock-db-firebase-adminsdk-gqird-158bc2be45.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sync-stock-db.firebaseio.com"
});

let db = admin.firestore();
module.exports = db;