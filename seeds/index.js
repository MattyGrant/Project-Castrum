// Run index separate from node app when we want to change data frpm DB
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const axios = require('axios');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Woo! You're in!");
});

const sample = array => array[Math.floor(Math.random() * array.length)]; 

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 150; i++) {
    // setup
      const citySeed = Math.floor(Math.random() * cities.length)
      const price = Math.floor(Math.random() *25) + 10;
    // seed data into campground
      const camp = new Campground({
        author: '62f1e3f41fc1b17504b1fb32',//Your User ID
        location: `${cities[citySeed].city}, ${cities[citySeed].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description:
          'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
        price,
        geometry: {
            type: 'Point',
            coordinates: [
                cities[citySeed].longitude,
                cities[citySeed].latitude
            ]
        },
        images: [
            {
                url: 'https://res.cloudinary.com/mrmatty/image/upload/v1660543597/YelpCamp/xhhr7oqkovgld4bnckfr.jpg',
                filename: 'YelpCamp/xhhr7oqkovgld4bnckfr',
              },
              {
                url: 'https://res.cloudinary.com/mrmatty/image/upload/v1660543597/YelpCamp/ne3qpxdc0vrzq14kvlfc.jpg',
                filename: 'YelpCamp/ne3qpxdc0vrzq14kvlfc',
              }
        ]
      })
   
      await camp.save()
    }
  }
seedDB().then(() => {
    mongoose.connection.close();
});
