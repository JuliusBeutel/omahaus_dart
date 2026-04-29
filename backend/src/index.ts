import express from 'express';
import cors from 'cors';
import sessionRouter from './routes/session';
import { getLocalIp } from './utils/networkIp';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api/sessions', sessionRouter);

app.get('/api/local-ip', (_req, res) => {
  res.json({ ip: getLocalIp() });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
