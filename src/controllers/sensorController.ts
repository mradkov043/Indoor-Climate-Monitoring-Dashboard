import { Request, Response } from 'express';
import { saveSensorDataToDatabase } from '../utils/databaseUtils';
import { fetchHistoricalData } from '../utils/databaseQueries';

export type SensorType = "Temperature" | "CO2 Concentration" | "Humidity";

interface SensorData {
    type: SensorType;
    value: string;
    timestamp: string;
}

export class SensorDataSubject {
    private observers = new Set<(data: SensorData) => void>();
    private lastValues: { [key in SensorType]?: SensorData } = {};
    private saveInterval: number = 120000;

    public addObserver(observer: (data: SensorData) => void): void {
        this.observers.add(observer);
    }

    public removeObserver(observer: (data: SensorData) => void): void {
        this.observers.delete(observer);
    }

    public notifyObservers(data: SensorData): void {
        this.observers.forEach(observer => observer(data));
    }

    public startEmitting(): void {
        const sensorTypes: SensorType[] = ["Temperature", "CO2 Concentration", "Humidity"];
        sensorTypes.forEach(type => {
            this.emitData(type);
            setInterval(() => this.saveDataToDatabase(type), this.saveInterval);
        });
    }

    private emitData(sensorType: SensorType): void {
        const newData = this.generateRandomSensorData(sensorType);
        if (!this.lastValues[sensorType] || this.lastValues[sensorType]!.value !== newData.value) {
            this.lastValues[sensorType] = newData;
            this.notifyObservers(newData);
        }
        setTimeout(() => this.emitData(sensorType), this.getRandomInterval());
    }

    private lastSavedValues: { [key in SensorType]?: SensorData } = {};

private saveDataToDatabase(sensorType: SensorType): void {
    const currentData = this.lastValues[sensorType];
    const lastSavedData = this.lastSavedValues[sensorType];

    if (currentData && (!lastSavedData || this.shouldSaveData(lastSavedData, currentData))) {
        saveSensorDataToDatabase(currentData).catch(err => {
            console.error(`Failed to save data for ${sensorType}:`, err);
        });
        this.lastSavedValues[sensorType] = { ...currentData };
    } else {
        console.log(`No changes to save for ${sensorType}`);
    }
}

private shouldSaveData(lastData: SensorData, currentData: SensorData): boolean {
    const timeDiff = new Date(currentData.timestamp).getTime() - new Date(lastData.timestamp).getTime();
    return lastData.value !== currentData.value || timeDiff > this.saveInterval;
}


    private generateRandomSensorData(sensorType: SensorType): SensorData {
        let value: number;
        let unit: string;
        switch (sensorType) {
            case "Temperature":
                value = Math.random() * 45 - 10;
                unit = '°C';
                break;
            case "CO2 Concentration":
                value = Math.random() * 701 + 300;
                unit = 'ppm';
                break;
            case "Humidity":
                value = Math.random() * 70 + 30;
                unit = '%';
                break;
        }
        return {
            type: sensorType,
            value: `${value.toFixed(2)} ${unit}`,
            timestamp: new Date().toISOString()
        };
    }

    private getRandomInterval(): number {
        return Math.random() * (30000 - 10000) + 10000;
    }
}

const sensorDataSubject = new SensorDataSubject();

export const streamSensorData = (req: Request, res: Response): void => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = (data: SensorData): void => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sensorDataSubject.addObserver(sendUpdate);
    req.on('close', () => {
        sensorDataSubject.removeObserver(sendUpdate);
        res.end();
    });

    sensorDataSubject.startEmitting();
};

export const getHistoricalData = async (req: Request, res: Response): Promise<void> => {
    let types = Array.isArray(req.query.types) ? req.query.types.map(String) : [String(req.query.types)];
    const startDate = req.query.startDate ? String(req.query.startDate) : null;
    const endDate = req.query.endDate ? String(req.query.endDate) : null;

    if (!startDate || !endDate || types.length === 0) {
        res.status(400).json({ message: "Missing required parameters: types, startDate, or endDate" });
        return;
    }

    try {
        const { data, statistics } = await fetchHistoricalData(types, startDate, endDate);
        res.json({ data, statistics });
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).send("Failed to fetch historical data.");
    }
};
