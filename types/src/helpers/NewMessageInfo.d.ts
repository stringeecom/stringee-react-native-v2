export class NewMessageInfo {
    constructor(props: {
        convId: string;
        type: number;
        message: {
            content: string;
            photo: {
                filePath: string;
                thumbnail: string;
                ratio: number;
            };
            video: {
                filePath: string;
                thumbnail: string;
                ratio: number;
                duration: number;
            };
            audio: {
                filePath: string;
                duration: number;
            };
            file: {
                filePath: string;
                filename: string;
                length: number;
            };
            location: {
                lat: number;
                lon: number;
            };
            contact: {
                vcard: string;
            };
            sticker: {
                category: string;
                name: string;
            };
        };
    });
    convId: string;
    type: number;
    message: {
        content: string;
        photo: {
            filePath: string;
            thumbnail: string;
            ratio: number;
        };
        video: {
            filePath: string;
            thumbnail: string;
            ratio: number;
            duration: number;
        };
        audio: {
            filePath: string;
            duration: number;
        };
        file: {
            filePath: string;
            filename: string;
            length: number;
        };
        location: {
            lat: number;
            lon: number;
        };
        contact: {
            vcard: string;
        };
        sticker: {
            category: string;
            name: string;
        };
    };
}
