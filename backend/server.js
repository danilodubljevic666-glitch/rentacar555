const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

// 1. Prvo kreiraj Express aplikaciju
const app = express();

// 2. CORS podešen za lokalni i produkcijski frontend
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://rentacar555.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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

// ============================================
// TEST RUTE
// ============================================

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

// ============================================
// JAVNE RUTE (za korisnike)
// ============================================

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

// 7. API za kreiranje rezervacije
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

// ============================================
// ADMIN RUTE (za admin panel)
// ============================================

// 8. Admin login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Pronađi admina u bazi
        const [admins] = await pool.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );
        
        if (admins.length === 0) {
            return res.status(401).json({ error: 'Pogrešno korisničko ime ili šifra' });
        }
        
        const admin = admins[0];
        
        // Provjeri šifru (običan string za sada)
        if (admin.password !== password) {
            return res.status(401).json({ error: 'Pogrešno korisničko ime ili šifra' });
        }
        
        res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Dohvati sve rezervacije (za admin panel)
app.get('/api/admin/reservations', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                r.id,
                r.customer_name,
                r.customer_email,
                r.customer_phone,
                DATE_FORMAT(r.start_date, '%d.%m.%Y') as start_date,
                DATE_FORMAT(r.end_date, '%d.%m.%Y') as end_date,
                r.total_price,
                r.status,
                DATE_FORMAT(r.created_at, '%d.%m.%Y %H:%i') as created_at,
                c.brand,
                c.model,
                c.year,
                CONCAT(c.brand, ' ', c.model, ' ', c.year) as car_name
            FROM reservations r
            JOIN cars c ON r.car_id = c.id
            ORDER BY r.created_at DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error('Greška pri dohvatanju rezervacija:', error);
        res.status(500).json({ error: error.message });
    }
});

// 10. Dohvati statistiku za admin panel
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Ukupan broj rezervacija
        const [totalRes] = await pool.execute('SELECT COUNT(*) as total FROM reservations');
        
        // Ukupna zarada
        const [totalEarnings] = await pool.execute('SELECT SUM(total_price) as total FROM reservations WHERE status IN ("confirmed", "completed")');
        
        // Aktivne rezervacije
        const [activeRes] = await pool.execute(`
            SELECT COUNT(*) as total 
            FROM reservations 
            WHERE CURDATE() BETWEEN start_date AND end_date 
            AND status IN ("confirmed", "pending")
        `);
        
        // Rezervacije po statusu
        const [statusCount] = await pool.execute(`
            SELECT status, COUNT(*) as count 
            FROM reservations 
            GROUP BY status
        `);
        
        res.json({
            total_reservations: totalRes[0].total,
            total_earnings: totalEarnings[0].total || 0,
            active_reservations: activeRes[0].total,
            status_breakdown: statusCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. Ažuriraj status rezervacije
app.put('/api/admin/reservations/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        await pool.execute(
            'UPDATE reservations SET status = ? WHERE id = ?',
            [status, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 12. Obriši rezervaciju
app.delete('/api/admin/reservations/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 13. Dohvati detalje o automobilu sa svim rezervacijama
app.get('/api/admin/cars/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [cars] = await pool.execute(
            'SELECT * FROM cars WHERE id = ?',
            [id]
        );
        
        if (cars.length === 0) {
            return res.status(404).json({ error: 'Auto nije pronađen' });
        }
        
        const [reservations] = await pool.execute(`
            SELECT * FROM reservations 
            WHERE car_id = ? 
            ORDER BY start_date DESC
        `, [id]);
        
        res.json({
            car: cars[0],
            reservations: reservations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 14. Root ruta (za provjeru da server radi)
app.get('/', (req, res) => {
    res.json({ 
        message: 'Rent-a-Car API radi!',
        endpoints: [
            '/api/test',
            '/api/cars',
            '/api/available-cars',
            '/api/reservations',
            '/api/admin/login',
            '/api/admin/reservations',
            '/api/admin/stats'
        ]
    });
});

// 15. Pokreni server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});