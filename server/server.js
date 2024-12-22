require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// MongoDB Connection with detailed logging
const connectDB = async () => {
    try {
        console.log('Starting MongoDB connection attempt...');
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'csvtojsonconverter',
            serverSelectionTimeoutMS: 10000,
            heartbeatFrequencyMS: 2000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('✅ MongoDB Connected Successfully to:', mongoose.connection.db.databaseName);

        // Create a test document to verify write access
        const TestSchema = new mongoose.Schema({
            test: String,
            date: { type: Date, default: Date.now }
        });
        
        const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);
        await Test.create({ test: 'connection-test' });
        console.log('✅ Test document created successfully');

    } catch (error) {
        console.error('❌ MongoDB connection error:', {
            message: error.message,
            code: error.code,
            details: error
        });
        
        // Retry connection
        console.log('⏳ Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB
connectDB();

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 MongoDB connection disconnected');
});

// Test route to verify database connection
app.get('/api/db-test', async (req, res) => {
    try {
        const Test = mongoose.model('Test');
        const testDoc = await Test.findOne({ test: 'connection-test' });
        
        res.json({
            status: 'success',
            connection: {
                isConnected: mongoose.connection.readyState === 1,
                database: mongoose.connection.db.databaseName,
                host: mongoose.connection.host
            },
            testDocument: testDoc
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            connectionState: mongoose.connection.readyState
        });
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
});
