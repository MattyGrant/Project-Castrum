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

// call unsplash and return small image
async function seedImg() {
    try {
        const res = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'FRf86VNXP0Zc1RNBrbOCswtRebKV1lqmQ6rfRtdSboY',
                collections: 1114848,
            },
      })
      return res.data.urls.small
    } catch (err) {
        console.error(err)
    }
}

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 20; i++) {
    // setup
      const placeSeed = Math.floor(Math.random() * places.length)
      const descriptorsSeed = Math.floor(Math.random() * descriptors.length)
      const citySeed = Math.floor(Math.random() * cities.length)
      const price = Math.floor(Math.random() *25) + 10;
    // seed data into campground
      const camp = new Campground({
        author: '62f1e3f41fc1b17504b1fb32', 
        image: await seedImg(),
        title: `${descriptors[descriptorsSeed]} ${places[placeSeed]}`,
        location: `${cities[citySeed].city}, ${cities[citySeed].state}`,
        description:
          'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
        price
      })
   
      await camp.save()
    }
  }
seedDB().then(() => {
    mongoose.connection.close();
});
