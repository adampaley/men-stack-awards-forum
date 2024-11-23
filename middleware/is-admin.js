const isAdmin = (req, res, next) => {
    // exit if user and an admin
    if (req.session.user && req.session.user.isAdmin) return next()
    res.send(`
        <p>Only admins allowed!</p>
        <p><a href="/forums">Back to Forums</a></p>
    `)
}
  
module.exports = isAdmin