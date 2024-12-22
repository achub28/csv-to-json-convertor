// Update the MongoDB connection part in server.js
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
