import { createPool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sensordata',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

type QueryResultType = [RowDataPacket[], ResultSetHeader];

export async function query<T extends QueryResultType>(sql: string, params?: any[]): Promise<T> {
    const [results] = await pool.query<T>(sql, params);
    return results;
}
