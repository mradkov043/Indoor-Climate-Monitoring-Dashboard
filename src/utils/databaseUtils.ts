import { pool } from '../database';

export const saveSensorDataToDatabase = async (data: any) => {
    const { type, value, timestamp } = data;
    try {
        const sql = `INSERT INTO sensor_data (sensor_type, value, timestamp) VALUES (?, ?, ?)`;
        const [result] = await pool.execute(sql, [type, value, timestamp]);
        console.log('Data saved to the database:', result);
    } catch (error) {
        console.error('Failed to save sensor data to the database:', error);
    }
};
