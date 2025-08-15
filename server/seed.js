import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examdb_simple';
await mongoose.connect(MONGO_URI);

const Item = mongoose.model('Item', new mongoose.Schema({ name: String, done: Boolean }));

await Item.deleteMany({});
await Item.insertMany([
  { name: 'Sample 1', done: false },
  { name: 'Sample 2', done: true }
]);

console.log('Seeded.');
process.exit(0);