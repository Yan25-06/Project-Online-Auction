import express from 'express';
import cors from 'cors';
import { exampleRouter } from './routes/example.route.js';
import { productRouter } from './routes/product.route.js';
import { categoryRouter } from './routes/category.route.js';
// import { sharedFunction } from 'shared-auction/test.js';

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(exampleRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});