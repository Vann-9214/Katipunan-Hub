import express from 'express';
import cors from 'cors';
import tutorApplicationRouter from './routes/tutor-application';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tutor-application', tutorApplicationRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
