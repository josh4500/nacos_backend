const mongoose = require("mongoose");
import Log from "../logger";

const MONGO_URI =
    process.env.NODE_ENV === "development"
        ? "mongodb://localhost:27017/nacos_db"
        : process.env.MONGO_URI || "mongodb://localhost:27017/nacos_db";

const connectDB = async () => {
    console.log("Node environment: " + process.env.NODE_ENV);
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true
        });

        process.env.NODE_ENV === "development" &&
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        Log.info(`Mongo DB Connected: ${conn.connection.host}`);
    } catch (error) {
        Log.error(`Error: ${error}`);
        process.exit(1);
    }
};

export default connectDB;
