// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Parser = require('rss-parser');
const cron = require('node-cron');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/autonews', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// News Schema
const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  url: String,
  urlToImage: String,
  publishedAt: Date,
  source: {
    name: String,
    url: String
  },
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model('News', newsSchema);

// NewsAPI Configuration
const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY'; // Get from newsapi.org
const NEWS_API_URL = 'https://newsapi.org/v2';

// RSS Feeds
const RSS_FEEDS = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'http://rss.cnn.com/rss/cnn_topstories.rss',
  'https://feeds.reuters.com/reuters/topNews',
  'https://www.theguardian.com/international/rss'
];

// Fetch news from NewsAPI
async function fetchFromNewsAPI() {
  try {
    const response = await axios.get(`${c139f17a5a414c1b8c9de1ac2eb3cfd4}/top-headlines`, {
      params: {
        apiKey: NEWS_API_KEY,
        country: 'us',
        pageSize: 50
      }
    });
    
    const articles = response.data.articles;
    for (const article of articles) {
      // Check if article already exists
      const exists = await News.findOne({ url: article.url });
      if (!exists) {
        const news = new News({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source,
          category: 'general'
        });
        await news.save();
      }
    }
    console.log('c139f17a5a414c1b8c9de1ac2eb3cfd4');
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
  }
}

// Fetch news from RSS feeds
async function fetchRSSFeeds() {
  const parser = new Parser();
  
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items) {
        // Check if article already exists
        const exists = await News.findOne({ url: item.link });
        if (!exists) {
          const news = new News({
            title: item.title,
            description: item.contentSnippet,
            url: item.link,
            urlToImage: item.enclosure ? item.enclosure.url : null,
            publishedAt: item.pubDate,
            source: {
              name: feed.title,
              url: feedUrl
            },
            category: 'general'
          });
          await news.save();
        }
      }
      console.log(`RSS feed ${feedUrl} fetch complete`);
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    }
  }
}

// Schedule news fetching
cron.schedule('0 */15 * * * *', () => {
  console.log('Running scheduled news fetch...');
  fetchFromNewsAPI();
  fetchRSSFeeds();
});

// API Endpoints
app.get('/api/news', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = category ? { category } : {};
    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await News.countDocuments(query);
    
    res.json({
      news,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const trending = await News.find()
      .sort({ publishedAt: -1 })
      .limit(5);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/breaking', async (req, res) => {
  try {
    const breaking = await News.find()
      .sort({ publishedAt: -1 })
      .limit(5);
    res.json(breaking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
