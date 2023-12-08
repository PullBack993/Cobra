require("dotenv/config");
const router = require("express").Router();
const xConfig = require("../../config/x");
const axios = require('axios');

router.post('/', async (req, res) => {
    const tweetText = req.body.text; // The text of your tweet
    const imageUrl = req.body.imageUrl; // The URL to your image
    const websiteUrl = req.body.websiteUrl; // The URL to your website
    const hashTags = req.body.hashTags
  try{
  const downStream = await axios({
    method: 'GET',
    responseType: 'arraybuffer',
    url: imageUrl,
  })
      // Upload the image to Twitter

      // const mediaResponse = await xConfig.v1.uploadMedia(downStream.data,{ mimeType: 'png'});
      // Append the website URL to the tweet text
      const fullTweetText = `${tweetText}. Read more: ${websiteUrl}`;
      const content = createTweetContent(fullTweetText, hashTags)
  
      
      // Post the tweet with the attached image and website link
      await xConfig.v2.tweet({text: content,
        // media: {media_ids: [mediaResponse]},
      });
  
      console.log('Tweet posted successfully');
      res.status(200).send('Tweet posted successfully');
    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error('Error posting tweet: Forbidden - Check API credentials and permissions.');
          } else if (error.response && error.response.status === 500) {
            console.error('Error posting tweet: Internal Server Error - Try again later.');
          } else {
            console.error('Error posting tweet:', error);
          }
          res.status(500).send('Error posting tweet');
    }
  });

  function createTweetContent (fullText, hashtags){
    const maxTwitCharLength = 280
  if (fullText > maxTwitCharLength) {
    return fullText
  }

  // Add hashtags to the tweet
  let tweetWithHashtags = fullText
  for (const hashtag of hashtags) {
    if (tweetWithHashtags.length + hashtag.length <= maxTwitCharLength) {
      tweetWithHashtags += ' ' + hashtag
    } else {
      // Reached the 280-character limit, stop adding hashtags
      break;
    }
  }
  return tweetWithHashtags
  }

module.exports = router;
