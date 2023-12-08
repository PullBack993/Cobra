export type IArticleDetails = {
    title: string;
    titleImage: string;
    imageUrl: string;
    sections: [
      {
        heading: string;
        text: [string];
        paragraph: string;
        image: [string];
        listItems: [string];
      }
    ];
    createTime: string;
  }