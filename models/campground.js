const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// Image schema to use for virtual properties
const ImageSchema = new Schema ({
    url: String,
    filename: String 
});
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_150');
});

const opts = { toJSON: { virtuals: true } };

// Very basic model schema for campground
const  CampgroundSchema = new Schema ({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
// one-to-many relationship
    reviews: [
        { //objectId from review model
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popupMarkup').get(function() {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,25)}...</p>`;
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
