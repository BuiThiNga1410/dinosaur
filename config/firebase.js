const admin = require('firebase-admin');
require("dotenv").config();
const serviceAccount = require('../dinosaur-web-firebase-adminsdk-l5zbu-e64b2ee8d0.json');

// Initialize firebase admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:process.env.BUCKET_NAME
})
// Cloud storage
const bucket = admin.storage().bucket()

module.exports = {
  bucket
}
