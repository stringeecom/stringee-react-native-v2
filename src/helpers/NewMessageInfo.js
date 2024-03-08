class NewMessageInfo {
  convId: string;
  type: number;
  message: {
    content: string,
    photo: {filePath: string, thumbnail: string, ratio: number},
    video: {
      filePath: string,
      thumbnail: string,
      ratio: number,
      duration: number,
    },
    audio: {filePath: string, duration: number},
    file: {filePath: string, filename: string, length: number},
    location: {lat: number, lon: number},
    contact: {vcard: string},
    sticker: {category: string, name: string},
  };

  constructor(props: {
    convId: string,
    type: number,
    message: {
      content: string,
      photo: {filePath: string, thumbnail: string, ratio: number},
      video: {
        filePath: string,
        thumbnail: string,
        ratio: number,
        duration: number,
      },
      audio: {filePath: string, duration: number},
      file: {filePath: string, filename: string, length: number},
      location: {lat: number, lon: number},
      contact: {vcard: string},
      sticker: {category: string, name: string},
    },
  }) {
    this.convId = props.convId;
    this.type = props.type;
    this.message = props.message;
  }
}

export {NewMessageInfo};
