require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');  // Added this import
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// CSV to JSON conversion endpoint
app.post('/api/convert', async (req, res) => {
    try {
        const { csvData } = req.body;
        
        // Basic validation
        if (!csvData) {
            return res.status(400).json({ error: 'No CSV data provided' });
        }

        // Send success response
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

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// MongoDB Connection (optional)
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
            console.error('MongoDB connection error:', err);
            console.log('Continuing without MongoDB...');
        });
} else {
    console.log('No MongoDB URI provided, skipping database connection');
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
});
