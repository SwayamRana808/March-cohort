import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors middleware
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: '*', // Or specify allowed origins like ['http://localhost:3000', 'https://your-production-domain.com']
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If you need to handle cookies, sessions, etc.
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Apply CORS middleware

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});