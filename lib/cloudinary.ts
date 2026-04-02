import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,                      
    api_key: process.env.CLOUDINARY_API_KEY,                            
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (base64Image: string, folder: string) => {
    const result = await cloudinary.uploader.upload(base64Image, {
        folder,
        transformation: [{
            overlay: {
                font_family: "Arial",
                font_size: 28,
                font_weight: "bold",
                text: "myhomestyler.com",
            },
            color: "#FFFFFF",
            opacity: 50,
            gravity: "south_east",
            x: 15,
            y: 15,
        }],
    });
    return result.secure_url;
}