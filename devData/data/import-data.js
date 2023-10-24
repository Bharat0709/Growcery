const fs = require('fs');

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Items = require('../../models/Itemsmodel');
// const User = require('../../models/user');
// const Address = require('../../models/address');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Established!!');
  });

const items = JSON.parse(
  fs.readFileSync(`${__dirname}/itemslist.json`, 'utf-8')
);
const address = JSON.parse(fs.readFileSync(`${__dirname}/address.json`, 'utf-8'));

const importData = async () => {
  try {
    // await Address.create(address);
    await Items.create(items);
    // await USer.create(user);
    console.log('Data Successfully Loaded');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    // await Items.deleteMany();
    // await User.deleteMany();
    await Items.deleteMany();
    console.log('Data Deleted');
    process.exit();
  } catch (arr) {
    console.log(err);
  }
};
console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
