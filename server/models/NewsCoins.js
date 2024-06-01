const { Schema, model } = require("mongoose");

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  titleImage: { type: String, required: true },
  sections: [
    {
      heading: {
        type: String,
        default: "",
      },
      text: [
        {
          type: String,
        },
      ],
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
  viewCount: { type: Number, default: 0 },
});

articleSchema.index({ title: 1 }, { unique: true });


const Article = model("Article", articleSchema);

module.exports = Article;
 