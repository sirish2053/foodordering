import mongoose from "mongoose";

export const connectDB= async () =>{
    await mongoose.connect('mongodb+srv://sirish:sirish@cluster0.60fcprt.mongodb.net/food-delivery').then(()=>console.log("DB Connected")); 
}
//mongodb+srv://sirish:20540920@cluster0.y1ooyku.mongodb.net/?