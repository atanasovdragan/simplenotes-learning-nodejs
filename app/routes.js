var Note = require('../app/models/note');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE
    // =====================================
    app.get('/', notLoggedIn, function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN
    // =====================================
    // show the login form
    app.get('/login', notLoggedIn, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs');
    });

    // process the login form
    app.post('/login', notLoggedIn, passport.authenticate('local-login', {
        successRedirect : '/notes', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP
    // =====================================
    // show the signup form
    app.get('/signup', notLoggedIn, function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs');
    });

    // process the signup form
    app.post('/signup', notLoggedIn, passport.authenticate('local-signup', {
        successRedirect : '/notes', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // NOTES SECTION
    // =====================================
    //create note form
    app.get('/notes/create', isLoggedIn, function(req, res) {
        res.render('create-note.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    //create note store
    app.post('/notes/create', isLoggedIn, function (req, res) {
        //validate fields
        req.checkBody({
            'title': {
                notEmpty: true,
                errorMessage: 'Title field is mandatory.'
            },
            'text': {
                notEmpty: true,
                errorMessage: 'Text field is mandatory.' // Error message for the parameter
            }
        });

        //get validation errors if there are any
        var errors = req.validationErrors();

        //check if there are any validation errors
        if (errors.length > 0) {
            req.flash('validation_errors', errors);
            res.redirect('/notes/create');
        } else {
            //store note
            var note = new Note({
                title: req.body.title,
                text: req.body.text,
                authorId: req.user._id
            });
            note.save(function(err, note) {
                if (err) {
                    req.flash('error', 'Something happen, please try again!');
                    res.redirect('/notes/create');
                } else {
                    req.flash('success', 'Note added successfully.');
                    res.redirect('/notes');
                }
            });
        }
    });

    //edit note form
    app.get('/notes/:id/edit', isLoggedIn, function(req, res) {
        Note.findOne({ _id: req.params.id, authorId: req.user._id }, function (err, doc) {
            res.render('edit-note.ejs', {
                user : req.user, // get the user out of session and pass to template
                note : doc // get specified note
            });
        });
    });

    //update note
    app.post('/notes/:id/update', isLoggedIn, function(req, res) {
        //validate fields
        req.checkBody({
            'title': {
                notEmpty: true,
                errorMessage: 'Title field is mandatory.'
            },
            'text': {
                notEmpty: true,
                errorMessage: 'Text field is mandatory.' // Error message for the parameter
            }
        });

        //get validation errors if there are any
        var errors = req.validationErrors();

        //check if there are any validation errors
        if (errors.length > 0) {
            req.flash('validation_errors', errors);
            res.redirect('/notes/' + req.params.id + '/edit');
        } else {
            //find specified note and make an update in database
            Note.findOne({_id: req.params.id, authorId: req.user._id}, function (err, doc) {
                doc.title = req.body.title;
                doc.text = req.body.text;
                doc.save(function (err) {
                    if (err) {
                        req.flash('error', 'Something happen, please try again!');
                        res.redirect('/notes/' + req.params.id + '/edit');
                    } else {
                        req.flash('success', 'Note updated successfully.');
                        res.redirect('/notes');
                    }
                });
            });
        }
    });

    //delete note
    app.post('/notes/:id/delete', isLoggedIn, function (req, res) {
        Note.remove({
            _id: req.params.id,
            authorId: req.user._id
        }, function (err, note) {
            if (err) {
                req.flash('error', 'Something happen, please try again!');
                res.redirect('/notes/' + req.params.id + '/edit');
            } else {
                req.flash('success', 'Note deleted successfully.');
                res.redirect('/notes');
            }
        });
    });

    //list all user notes
    app.get('/notes', isLoggedIn, function(req, res) {
        Note.find({ authorId: req.user._id }, function (err, docs) {
            res.render('notes.ejs', {
                user : req.user, // get the user out of session and pass to template
                notes : docs // get all notes where logged in user is an author
            });
        });
    });

    // =====================================
    // LOGOUT
    // =====================================
    app.get('/logout', isLoggedIn, function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// check if user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

//check if user is not logged in
function notLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        res.redirect('/notes');

    // if they aren't redirect them to the home page
    return next();
}