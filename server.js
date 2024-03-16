const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

async function initialize() {
    try {
        await mongoose.connect('mongodb+srv://akshat1021be21:Devil%40128@urlcluster.drr2o5l.mongodb.net/?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000
        });
        console.log('Connected to MongoDB');

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server is running");
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

initialize();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async(req, res) => {
    try {
        const shortUrls = await ShortUrl.find();
        res.render('index', { shortUrls: shortUrls });
    } catch (error) {
        console.error('Error fetching short URLs:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/shortUrls', async(req, res) => {
    try {
        await ShortUrl.create({ full: req.body.fullUrl });
        const shortUrls = await ShortUrl.find();
        res.render('index', { shortUrls: shortUrls });
    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/:shortUrl', async(req, res) => {
    try {
        const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
        if (!shortUrl) {
            return res.sendStatus(404);
        }
        shortUrl.clicks++;
        await shortUrl.save();
        res.redirect(shortUrl.full);
    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).send('Internal Server Error');
    }
});