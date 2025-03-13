import express from 'express';
import {streamSensorData } from '../controllers/sensorController';
import { getHistoricalData } from '../controllers/sensorController';
const router = express.Router();

router.get('/stream', streamSensorData);
router.get('/historical', getHistoricalData);
export default router;
