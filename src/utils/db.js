import mongoose from 'mongoose';
// import {User} from '../models/user.js';
export const connectDb = async () => {
    try{
        const {connection} = await mongoose.connect(process.env.MONGO_DB_URL,{dbName:"UserDb"})
        console.log("Connected to db")
        console.log(connection)
        // new User({
        //     teamName: "Team 1",
        //     location: "Location 1",
        //     question: "Question 1"
        // }).save()
        // console.log("User saved");
    }catch(error)
    {
        console.log("Error in connecting to db",error)
    }
}