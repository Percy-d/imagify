import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectFirestore from './config/firestore.js';
import userRouter from './routes/userRoute.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 4000;
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }));
await connectFirestore();

app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/',(req, res)=> res.send("Api is working"));

app.listen(PORT, ()=> console.log("Server running on port " + PORT) );