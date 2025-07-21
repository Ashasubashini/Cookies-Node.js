const express = require('express');
const cors = require('cors');
const bcrypt = require('./node_modules/bcryptjs/umd');
const jwt = require('jsonwebtoken');
const pool = require('./config/db.config');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/plain' }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001',
}));

let refreshTokens = [];


app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ('${name}', '${email}', '${hashedPassword}')
      RETURNING id, name, email
    `;
    const result = await pool.query(query);
    res.status(201).json({ user: result.rows[0], message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    const userResult = await pool.query(query);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.REFRESH_TOKEN,
      { expiresIn: '1d' }
    );
    refreshTokens.push(refreshToken);

    res.json({ accessToken: accessToken,refreshToken:refreshToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/refreshtoken', (req, res) => {
  const {refreshToken} = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token is required.' });
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: 'Invalid refresh token.' });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    const accessToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ accessToken: accessToken });
  });
});
app.delete('/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.json({ message: 'Logged out successfully.' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) return res.status(401).json({ message: 'No token provided.' });

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

app.get('/verify', authenticateToken, (req, res) => {
  res.json({ message: 'Token is valid.', user: req.user });
});

app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

app.get('/products', async (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId) {
    return res.status(400).json({ message: 'categoryId is required.' });
  }
  try {
    const result = await pool.query(
      'SELECT id, name, price, category_id, created_at FROM products WHERE category_id = $1',
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

app.post('/save-clicks', async (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ message: 'Invalid JSON' });
    }
  }
  const { userId, categoryClicks, productClicks } = body;

  if (!userId || typeof categoryClicks !== 'object' || typeof productClicks !== 'object') {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    await pool.query(
      'INSERT INTO user_clicks (user_id, category_clicks, product_clicks) VALUES ($1, $2, $3)',
      [userId, categoryClicks, productClicks]
    );
    res.json({ message: 'Clicks saved!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/recommendations', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  try {
    const clicksResult = await pool.query(
      'SELECT category_clicks FROM user_clicks WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
      [userId]
    );
    if (clicksResult.rows.length === 0) {
      return res.json([]);
    }
    const categoryClicks = clicksResult.rows[0].category_clicks;
    let maxCategory = null;
    let maxCount = -1;
    for (const [cat, count] of Object.entries(categoryClicks)) {
      if (count > maxCount) {
        maxCategory = cat;
        maxCount = count;
      }
    }
    if (!maxCategory) {
      return res.json([]);
    }
    const catResult = await pool.query('SELECT id FROM categories WHERE name = $1', [maxCategory]);
    if (catResult.rows.length === 0) {
      return res.json([]);
    }
    const categoryId = catResult.rows[0].id;
    const prodResult = await pool.query(
      'SELECT id, name, price, category_id, created_at FROM products WHERE category_id = $1',
      [categoryId]
    );
    res.json(prodResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch recommendations.' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});





module.exports = app; 

