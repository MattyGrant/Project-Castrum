const Campground = require('../models/campground');

module.exports.campgroundIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Campground created successfully!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showPage = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({ 
        path:'reviews',
        populate: { // Nested populate for author OF reviews
            path:'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Uh oh! Campground no longer available');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.editCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Uh oh! Campground no longer available');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground });
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampgrounds = async (req, res) =>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');

};