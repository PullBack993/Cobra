const router = require("express").Router();
const axios = require("axios");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { initializeApp } = require("firebase/app");


const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const CoinImages = require("../../models/CoinImage");

async function uploadImagesToFirebase(links, coinName = "") {
  const storage = getStorage(initialFirebaseStore());

  for (const link of links) {
    try {
      const response = await axios.get(link, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data, "binary");
      const f = link.split('/').pop().split("?")[0]; // Extract filename from URL
      const fileExtension = f.split('.').pop().toLowerCase();
      const backupFileName = link.split("/").pop().split("?")[0]
      const fileName = coinName ? coinName + `.${fileExtension}` : backupFileName; // Extract filename from URL

      if (!(await CoinImages.findOne({ symbol: coinName ? coinName : backupFileName}))) {
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, buffer, { customMetadata: { resize: "false" } });
        const imageUrl = await getDownloadURL(storageRef);

        const newImage = new CoinImages({symbol: coinName ? coinName : backupFileName, filename: fileName, path: imageUrl });
        await newImage.save();
      }
    } catch (error) {
      console.error(`Error processing ${link}: ${error.message}`);
    }
  }
}

function initialFirebaseStore() {
  const firebaseConfig = {
    apiKey: process.env.FIRE_API_KEY,
    authDomain: process.env.FIRE_AUTH_DOMAIN,
    projectId: process.env.FIRE_PROJECT_ID,
    storageBucket: process.env.FIRE_STORAGE_BUCKET,
    appId: process.env.FIRE_APP_ID,
    measurementId: process.env.FIRE_MEASURMENT_ID,
  };

  return initializeApp(firebaseConfig);
}

module.exports =  {router, uploadImagesToFirebase };