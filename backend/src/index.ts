import express from 'express';
import { exampleRouter } from './routes/example.route.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(exampleRouter) 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});