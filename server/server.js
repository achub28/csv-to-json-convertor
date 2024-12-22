// Add this to your server.js
app.post('/api/convert', async (req, res) => {
    try {
        const { csvData } = req.body;
        
        // Validate input
        if (!csvData) {
            return res.status(400).json({ error: 'No CSV data provided' });
        }

        // Create conversion schema
        const ConversionSchema = new mongoose.Schema({
            csvData: String,
            jsonResult: Object,
            createdAt: { type: Date, default: Date.now }
        });

        // Get or create model
        const Conversion = mongoose.models.Conversion || mongoose.model('Conversion', ConversionSchema);

        // Simple CSV to JSON conversion (example)
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');
        const jsonResult = rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim();
                return obj;
            }, {});
        });

        // Save to database
        const conversion = await Conversion.create({
            csvData,
            jsonResult
        });

        res.json({
            success: true,
            data: {
                original: csvData,
                converted: jsonResult,
                _id: conversion._id
            }
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
