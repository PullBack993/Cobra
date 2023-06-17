export type Article = {
    _id: string,
    title: string;
    titleImage: string;
    sections: Array<{
      heading: string;
      text: Array<string>;
      paragraph: string;
      image: Array<string>;
      listItems: Array<string>;
    }>;
    createTime: string;
  }