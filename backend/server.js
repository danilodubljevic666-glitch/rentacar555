const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Secret za JWT
const JWT_SECRET = 'tvoj-tajni-kljuc-za-jwt-promijeni-ovo-u-produkciji';
// Middleware
app.use(cors());
app.use(express.json());

// MySQL konekcija
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rentacar_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test konekcije
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        res.json({ message: 'Konekcija sa bazom je uspješna!', solution: rows[0].solution });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API za sve automobile
app.get('/api/cars', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cars WHERE is_active = true');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API za provjeru dostupnosti
app.post('/api/check-availability', async (req, res) => {
    const { car_id, start_date, end_date } = req.body;
    
    try {
        const [rows] = await pool.execute(`
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
        
        const isAvailable = rows[0].count === 0;
        res.json({ available: isAvailable });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API za kreiranje rezervacije
app.post('/api/reservations', async (req, res) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
        const { car_id, customer_name, customer_email, customer_phone, start_date, end_date } = req.body;
        
        // Provjeri dostupnost
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
            return res.status(400).json({ error: 'Auto nije dostupan u traženom periodu' });
        }
        
        // Izračunaj cijenu
        const [carPrice] = await connection.execute('SELECT price_per_day FROM cars WHERE id = ?', [car_id]);
        const start = new Date(start_date);
        const end = new Date(end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
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

// API za dostupne automobile u periodu
app.get('/api/available-cars', async (req, res) => {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date i end date su obavezni' });
    }
    
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
        res.status(500).json({ error: error.message });
    }
});

// Pokreni server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
// ============ ADMIN AUTH RUTE ============

// Login
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
        
        // Provjeri šifru (za sada običan string, kasnije možeš dodati bcrypt)
        if (admin.password !== password) {
            return res.status(401).json({ error: 'Pogrešno korisničko ime ili šifra' });
        }
        
        // Kreiraj token
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware za provjeru tokena
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Niste autorizovani' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token nije validan' });
        }
        req.user = user;
        next();
    });
};

// ============ ADMIN API RUTE (ZAŠTIĆENE) ============

// Dohvati sve rezervacije (zaštićeno)
app.get('/api/admin/reservations', authenticateToken, async (req, res) => {
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

// Dohvati statistiku (zaštićeno)
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        // Ukupan broj rezervacija
        const [totalRes] = await pool.execute('SELECT COUNT(*) as total FROM reservations');
        
        // Ukupna zarada (samo potvrđene i završene)
        const [totalEarnings] = await pool.execute(
            'SELECT SUM(total_price) as total FROM reservations WHERE status IN ("confirmed", "completed")'
        );
        
        // Broj aktivnih rezervacija (trenutno)
        const [activeRes] = await pool.execute(`
            SELECT COUNT(*) as total 
            FROM reservations 
            WHERE CURDATE() BETWEEN start_date AND end_date 
            AND status IN ("confirmed", "pending")
        `);
        
        // Rezervacije po statusu
        const [statusCount] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count 
            FROM reservations 
            GROUP BY status
        `);
        
        // Mjesečna zarada (posljednjih 6 mjeseci)
        const [monthlyEarnings] = await pool.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(total_price) as earnings,
                COUNT(*) as reservations_count
            FROM reservations
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            AND status IN ("confirmed", "completed")
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);
        
        res.json({
            total_reservations: totalRes[0].total,
            total_earnings: totalEarnings[0].total || 0,
            active_reservations: activeRes[0].total,
            status_breakdown: statusCount,
            monthly_earnings: monthlyEarnings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ažuriraj status rezervacije (zaštićeno)
app.put('/api/admin/reservations/:id/status', authenticateToken, async (req, res) => {
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

// Obriši rezervaciju (zaštićeno)
app.delete('/api/admin/reservations/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dohvati detalje o automobilu (zaštićeno)
app.get('/api/admin/cars/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        const [cars] = await pool.execute(
            'SELECT * FROM cars WHERE id = ?',
            [id]
        );
        
        if (cars.length === 0) {
            return res.status(404).json({ error: 'Auto nije pronađen' });
        }
        
        // Dohvati sve rezervacije za ovaj auto
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