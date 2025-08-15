import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examdb_simple';
await mongoose.connect(MONGO_URI);

const Item = mongoose.model('Item', new mongoose.Schema({ name: String, done: Boolean }));

app.get('/api/items', async (req, res) => {
  const items = await Item.find().sort({ _id: -1 });
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const item = await Item.create({ name: req.body.name || '', done: false });
  res.status(201).json(item);
});

app.put('/api/items/:id', async (req, res) => {
  const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.listen(5000, () => console.log('API on http://localhost:5000'));