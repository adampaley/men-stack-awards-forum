/* Adapted, unsuccessful example of preventing duplicate Forum fields

// models/forum.js
// case-insensitive index on name, prevents duplicates
forumSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } }) // include HTTP # message?

// server.js
// POST /forums
app.post("/forums", async (req, res) => {
    try {
        const { name, description } = req.body
        const existingForum = await Forum.findOne({ name: name }).collation({ local: 'en', strength: 2 }) // find match, case-insensitive
        if (existingForum) { // throw error
            return res.status(400).json({ error: 'Forum already exists.'})
        }
        const newForum = new Forum({
            name,
            description,
          });
      
          await newForum.save();
          res.status(201).json(newForum);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Forum already exists.'})
        }
        res.status(500).json({ error: err.message })
    }
})

*/