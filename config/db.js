const mongoose = require('mongoose');

const connectDb = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(console.log(`DB CONNECTION SUCCESSFULL...`))
    .catch(error => {
        console.log(`DB CONNECTION FAILED...`);
        console.log(error);
        process.exit(1);
    });
}

module.exports = connectDb;