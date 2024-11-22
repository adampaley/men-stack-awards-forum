const { Forum } = require('../models/forum.js')

const allowPagination = async (req, res, next) => {
    try {
        const postsPerPage = 10
        const currentPage = parseInt(req.query.page) || 1
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId)

        // Calculate total posts and pages
        const totalPosts = currentTopic.posts.length
        const totalPages = totalPosts > 0 ? Math.ceil(totalPosts / postsPerPage) : 1

        // Ensure that the currentPage is within valid range
        const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
        const skip = (validCurrentPage - 1) * postsPerPage

        // Prepare paginated posts
        const paginatedPosts = totalPosts > 0 ? currentTopic.posts.slice(skip, skip + postsPerPage) : []

        // Add pagination data to res.locals for easy access in route handlers
        res.locals.pagination = {
            postsPerPage,
            currentPage: validCurrentPage,
            totalPages,
            posts: paginatedPosts
        }

        // Pass control to the next middleware or route handler
        next()
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
}

module.exports = allowPagination