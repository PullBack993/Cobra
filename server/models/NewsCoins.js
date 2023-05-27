const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sections: [{
    heading: {
      type: String
    },
    text: {
      type: String,
      required: true
    },
    image: {
      type: String
    }
  }]
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
