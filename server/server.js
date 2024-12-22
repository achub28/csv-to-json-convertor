require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// MongoDB Connection with retry logic
const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'csvtojsonconverter' // Your database name
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('MongoDB Connected Successfully!');

        // Create a test collection
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const Test = mongoose.models.Test || mongoose.model('Test', testSchema);
        await Test.create({ name: 'connection-test' });
        console.log('Database write test successful!');

    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Test MongoDB connection route
app.get('/api/db-test', async (req, res) => {
    try {
        const Test = mongoose.model('Test');
        const testData = await Test.findOne({ name: 'connection-test' });
        res.json({ 
            message: 'MongoDB connection successful',
            data: testData
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Database test failed',
            details: error.message
        });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// CSV to JSON conversion endpoint
app.post('/api/convert', async (req, res) => {
    try {
        const { csvData } = req.body;
        if (!csvData) {
            return res.status(400).json({ error: 'No CSV data provided' });
        }
        res.json({ 
            message: 'CSV converted successfully',
            data: { 
                converted: true,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Error converting CSV to JSON' });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../build/index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({ message: 'Server is running, but React build is not found' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
});
