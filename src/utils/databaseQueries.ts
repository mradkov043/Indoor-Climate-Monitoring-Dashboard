import { pool } from '../database';
import { RowDataPacket, OkPacket, ResultSetHeader, FieldPacket } from 'mysql2';

interface SensorData {
    id: number;
    sensor_type: string;
    value: string;
    timestamp: string;
}

interface SensorStatistics {
    sensor_type: string;
    average_value: string;
    peak_value: string;
}

function formatValueWithUnit(sensor_type: string, value: number): string {
    let formattedValue = value.toFixed(2);
    switch (sensor_type) {
        case "Temperature":
            return `${formattedValue} °C`;
        case "CO2 Concentration":
            return `${formattedValue} ppm`;
        case "Humidity":
            return `${formattedValue}%`;
        default:
            return `${formattedValue}`;
    }
}

export async function fetchHistoricalData(types: string[], startDate: string, endDate: string): Promise<{ data: SensorData[], statistics: SensorStatistics[] }> {
    const dataQuery = `SELECT * FROM sensor_data WHERE sensor_type IN (?) AND timestamp BETWEEN ? AND ? ORDER BY timestamp`;
    const statsQuery = `SELECT sensor_type, MAX(value) AS peakValue, AVG(value) AS averageValue FROM sensor_data WHERE sensor_type IN (?) AND timestamp BETWEEN ? AND ? GROUP BY sensor_type`;

    try {
        const [dataResults, dataFields]: [RowDataPacket[], FieldPacket[]] = await pool.query(dataQuery, [[...types], startDate, endDate]);
        const [statsResults, statsFields]: [RowDataPacket[], FieldPacket[]] = await pool.query(statsQuery, [[...types], startDate, endDate]);

        const formattedData = dataResults.map((entry: RowDataPacket) => ({
            id: entry.id,
            sensor_type: entry.sensor_type,
            value: formatValueWithUnit(entry.sensor_type, parseFloat(entry.value as string)),
            timestamp: entry.timestamp
        }));

        const formattedStats = statsResults.map((stat: RowDataPacket) => ({
            sensor_type: stat.sensor_type,
            average_value: formatValueWithUnit(stat.sensor_type, parseFloat(stat.averageValue as string)),
            peak_value: formatValueWithUnit(stat.sensor_type, parseFloat(stat.peakValue as string))
        }));

        return { data: formattedData, statistics: formattedStats };
    } catch (error) {
        console.error('Failed to fetch historical data:', error);
        throw error;
    }
}
