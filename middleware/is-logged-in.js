const isLoggedIn = (req, res, next) => {
    // exit if user logged in
    if (req.session.user) return next()

    // store original URL to return user to page
    req.session.returnTo = req.originalUrl
    res.redirect("/auth/log-in")
}
  
module.exports = isLoggedIn