const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

// 1. Prvo kreiraj Express aplikaciju
const app = express();

// 2. Onda dodaj middleware
app.use(cors()); // Za sada običan CORS
app.use(express.json());

// 3. MySQL konekcija
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rentacar_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 4. Test ruta
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        res.json({ 
            success: true, 
            message: 'Konekcija sa bazom je uspješna!', 
            solution: rows[0].solution 
        });
    } catch (error) {
        console.error('Greška:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. API za automobile
app.get('/api/cars', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cars WHERE is_active = true');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. API za dostupne automobile
app.get('/api/available-cars', async (req, res) => {
    const { start_date, end_date } = req.query;
    
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM reservations r 
                    WHERE r.car_id = c.id 
                    AND r.status IN ('pending', 'confirmed')
                    AND (
                        (r.start_date BETWEEN ? AND ?) OR
                        (r.end_date BETWEEN ? AND ?) OR
                        (r.start_date <= ? AND r.end_date >= ?)
                    )) as reservation_count
            FROM cars c
            WHERE c.is_active = true
            HAVING reservation_count = 0
        `, [start_date, end_date, start_date, end_date, start_date, end_date]);
        
        res.json(rows);
    } catch (error) {
        console.error('Greška:', error);
        res.json([]);
    }
});

// 7. API za rezervacije
app.post('/api/reservations', async (req, res) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
        const { car_id, customer_name, customer_email, customer_phone, start_date, end_date } = req.body;
        
        // Provjera dostupnosti
        const [availability] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM reservations 
            WHERE car_id = ? 
            AND status IN ('pending', 'confirmed')
            AND (
                (start_date BETWEEN ? AND ?) OR
                (end_date BETWEEN ? AND ?) OR
                (start_date <= ? AND end_date >= ?)
            )
        `, [car_id, start_date, end_date, start_date, end_date, start_date, end_date]);
        
        if (availability[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Auto nije dostupan' });
        }
        
        // Izračunaj cijenu
        const [carPrice] = await connection.execute('SELECT price_per_day FROM cars WHERE id = ?', [car_id]);
        const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1;
        const total_price = carPrice[0].price_per_day * days;
        
        // Kreiraj rezervaciju
        const [reservation] = await connection.execute(`
            INSERT INTO reservations (car_id, customer_name, customer_email, customer_phone, start_date, end_date, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [car_id, customer_name, customer_email, customer_phone, start_date, end_date, total_price]);
        
        await connection.commit();
        res.json({ success: true, reservation_id: reservation.insertId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// 8. Pokreni server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});