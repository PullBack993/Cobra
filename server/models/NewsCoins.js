const { Schema, model } = require("mongoose");

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  sections: [
    {
      heading: {
        type: String,
        default: "",
      },
      text: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        default: "",
      },
    },
  ],
  createTime: {type: String, required: true },
});

const Article = model("Article", articleSchema);

module.exports = Article;
