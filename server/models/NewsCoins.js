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
      },
      paragraph: {
        type: String,
      },

      image: [
        {
          type: String,
        },
      ],
      listItems: [
        {
          type: String,
        },
      ],
    },
  ],
  createTime: { type: String, required: true },
});

const Article = model("Article", articleSchema);

module.exports = Article;
