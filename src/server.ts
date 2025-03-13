import express from 'express';
import sensorRoutes from './routes/sensorRoutes';
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.use('/api/sensors', sensorRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
