const express = require('express');
const router = express.Router();
const stream = require('getstream');
const axios = require('axios');
const Parser = require('rss-parser');

require('dotenv').config();

const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;
// const nytApiKey = process.env.NYT_API_KEY; // REMOVE if using BBC

const client = stream.connect(streamApiKey, streamApiSecret);

router.post('/registration', async (req, res) => {
  try {
    const username = req.body.username.replace(/\s/g, '_').toLowerCase();

    const userToken = client.createUserToken(username);

    client.user("username").getOrCreate({ //CHECK ON THIS!!! "username"->username - line 185 in readme
      api_key: streamApiKey,
      name: "username",
    });

    const userFeed = await client.feed('user', username);

    await userFeed.follow('source', 'reddit');

    await userFeed.follow('source', 'nyt');

    await userFeed.follow('source', 'bbc');

    res.status(200).json({
      userToken,
      streamApiKey,
      username
    });

  } catch (err) {
    console.error(err);
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/initialize', async (req, res) => {
  try {
    await client.user('reddit').getOrCreate({
      name: 'reddit'
    });

    const redditFeed = await client.feed('source', 'reddit');

    const redditUpdate = await axios.get('https://www.reddit.com/r/popular/top.json?count=3');

    console.log('reddit: ', redditUpdate);

    const popularPosts = redditUpdate.data.data.children;

    popularPosts.forEach(async (post) => {
      await redditFeed.addActivity({
        'actor': 'reddit',
        'verb': 'post',
        'object': post.data.url,
        'subreddit': post.data.subreddit,
        'title': post.data.title,
        'thumbnail': post.data.thumbnail,
        'url': post.data.url,
        'foreignId': post.data.id,
        'author': post.data.author
      });

    });

    //BBC INITIALIZATION
    await client.user('bbc').getOrCreate({
      name: 'bbc'
    });

    const bbcFeed = await client.feed('source', 'bbc');

    const parser = new Parser();

    const feed = await parser.parseURL('http://feeds.bbci.co.uk/news/rss.xml?edition=uk#');

    feed.items.forEach(async (article) => {
      await bbcFeed.addActivity({
        'actor': 'bbc',
        'verb': 'article',
        'object': article.link,
        'title': article.title,
        'abstract': article.contentSnippet,
        'date': article.isoDate,
      });
    });

    //NYT INITIALIZATION
    // await client.user('nyt').getOrCreate({
    //   name: 'New York Times'
    // });

    // const nytFeed = await client.feed('source', 'nyt');

    // const nytUpdate = await axios.get(`https://api.nytimes.com/svc/mostpopular/v2/viewed/1.json?api-key=${nytApiKey}`);

    // nytUpdate.data.results.forEach(async (article) => {
    //   await nytFeed.addActivity({
    //     'actor': 'nyt',
    //     'verb': 'article',
    //     'object': article.url,
    //     'title': article.title,
    //     'abstract': article.abstract,
    //     'date': article.published_date,
    //     'author': article.author,
    //     'section': article.section,
    //   });
    // });

    // await client.user('npr').getOrCreate({
    //   name: 'npr'
    // });

    res.status(200);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // NYT WEBHOOK VIA IFTTT
// router.post('/nyt-ifttt-webhook', async (req, res) => {
//   try {
//     const nytFeed = await client.feed('source', 'nyt');

//     console.log('nyt webhook hit', req.body); //DELETE ME

//     await nytFeed.addActivity({
//       'actor': 'nyt',
//       'verb': 'article',
//       'object': article.articleUrl,
//       'title': article.title,
//       'abstract': article.blurb,
//       'date': article.PublishedDate,
//       'author': article.author,
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: err.message });
//   }
//   res.status(200);
// });

router.post('/reddit-zapier-webhook', async (req, res) => {
  try {
    const redditFeed = await client.feed('source', 'reddit');

    const post = await req;

    await redditFeed.addActivity({
      'actor': 'reddit',
      'verb': 'post',
      'object': post.body.url,
      'title': post.body.title,
      'author': post.body.author,
      'subreddit': post.body.subreddit,
      'thumbnail': post.body.thumbnail,
      'url': post.body.url,
      'foreignId': post.body.id,
    });

    res.status(200);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: err.message });
  }

});



// npr via IFTTT

// router.post('/npr-webhook', async (req, res) => {
//   try {
//     const nprFeed = await client.feed('source', 'npr');


//     console.log('npr hit', req.body); //DELETE ME

//     await nytFeed.addActivity({
//       'actor': 'npr',
//       'verb': 'article',
//       'object': req.body.storyUrl,
//       'title': req.body.StoryTitle,
//       'abstract': req.body.StoryExcerpt,
//       'date': req.body.PublishedAt,
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: err.message });
//   }
//   res.status(200);
// });


// bbc via zapier
router.post('/bbc', async (req, res) => {
  try {
    const bbcFeed = await client.feed('source', 'bbc');

    await bbcFeed.addActivity({
      'actor': 'bbc',
      'verb': 'article',
      'object': req.body.link,
      'title': req.body.title,
      'abstract': req.body.blurb,
      'date': req.body.date,
    });
    2;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: err.message });
  }
  res.status(200);
});

module.exports = router;
