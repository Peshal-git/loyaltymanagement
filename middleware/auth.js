const customAuth = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    }
}

module.exports = customAuth