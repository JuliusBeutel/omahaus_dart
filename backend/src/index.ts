import express from 'express';
import cors from 'cors';
import sessionRouter from './routes/session';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use('/api', sessionRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
