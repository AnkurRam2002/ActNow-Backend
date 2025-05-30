const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const existingCollections = mongoose.connection.collections;

router.get('/check', async (req, res) => {
  try {
    const collectionNames = Object.keys(existingCollections);

    if (collectionNames.length > 0) {
      const collectionName = collectionNames[0];
      const collection = existingCollections[collectionName];

      const count = await collection.countDocuments();

      console.log(`Health check on ${collectionName}: ${count} docs`);
    } else {
      console.log('No collections found — skipping DB operation.');
    }

    res.status(200).json({ status: 'OK', message: 'Service is healthy' });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({ status: 'ERROR', message: 'Service unavailable' });
  }
});

module.exports = router;
