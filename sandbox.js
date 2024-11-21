/* trying to get all log in and register pages to redirect to back to where they were clicked

    <p>
        <a href="/auth/register?returnTo={{request.originalUrl}}">Register</a> <a href="/auth/log-in?returnTo={{request.originalUrl}}">Log In</a>
    </p>    <p>
        <a href="/auth/register?returnTo={{request.originalUrl}}">Register</a> <a href="/auth/log-in?returnTo={{request.originalUrl}}">Log In</a>
    </p>

*/

/* // POST /predictions
app.post("/predictions", isLoggedIn, async (req, res) => {
    const userId = req.session.user._id
    const category = req.body.category

    // check if user has already created prediction
    const existingPrediction = await Prediction.findOne({ user: userId, category: category })
    if (existingPrediction) {
        return res.redirect(`/predictions/${existingPrediction._id}/edit`)
    }

    // prepare contenders
    const rankings = []
    const selectedContenders = categories[category].map((contender, index) => {
        const rank = req.body[`rank${index+1}`]

        // only include ranked contenders
        if (rank) {
            // check if ranked used
            if (rankings.includes(rank)) {
                return res.send("Error: Each rank must be unique.")
            }
            rankings.push(rank)

            return {
                name: contender,
                rank: rank,
                points: 5 - rank
            }
        }
        
    }).filter(contender => contender) // remove unranked

    if (selectedContenders.length < 5) {
        return res.send("Error: Select 5 contenders.")
    }

    // create prediction
    await Prediction.create({category, user: userId, contenders: selectedContenders})

    res.redirect("predictions")
})
*/