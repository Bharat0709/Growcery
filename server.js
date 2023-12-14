//  ADDING APP FROMM THE APP SECTION TO ENABLE EXPRESS AND ALLL THE MIDDLEWARES BEFORE EXCUTING ANY QUERY

const app = require('./app');
const express = require('express');

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const dotenv = require('dotenv');



const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

dotenv.config({ path: './.env' });
const mongoURI = process.env.DATABASE; 

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
});
