const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// Very basic model schema for campground
const  CampgroundSchema = new Schema ({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
// one-to-many relationship
    reviews: [
        { //objectId from review model
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// mongoose middleware for deleting campground and contents
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if (doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
// Export model
module.exports = mongoose.model('Campground', CampgroundSchema);
