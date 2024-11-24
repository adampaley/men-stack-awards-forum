// const returnToRequestedURL = (req, res, next) => {
//     // store original URL to return user to page

//     // add logic to apply only if user clicks login, logout, or register
//     // if (!req.session.user)
//     // req.session.returnTo = req.originalUrl
//     const req.session.originalUrl = req.originalUrl
//     next()
// }
  
// module.exports = returnToRequestedURL

/* 
add middleware that is universal so that page URL is captured
add variable to navBar that saves the URL so it cannot change
add query to log in, logout, and register links
capture query in login... get route handlers
pass through locals object
?? does it need to be submitted, if yes then hidden input
handle query redirect in post links
*/