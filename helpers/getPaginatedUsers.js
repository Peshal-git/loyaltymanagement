const User = require('../models/userModel')
const getPaginatedUsers = async (query, page = 1, limit = 5) => {
    let usersToSkip = (page - 1) * limit;

    // Build search criteria based on the query
    let searchCriteria = {};
    if (query) {
        searchCriteria = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        };
    }

    // Get total users and calculate pagination details
    const totalUsers = await User.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalUsers / limit);

    // Adjust page if it's out of bounds
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    // Pagination details
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const currentPage = page;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Fetch the users based on search criteria, skipping and limiting
    const usersToShow = await User.find(searchCriteria).skip(usersToSkip).limit(limit);

    return {
        user: usersToShow,
        totalPages,
        prevPage,
        nextPage,
        currentPage,
        pages
    }
}

module.exports = {
    getPaginatedUsers
}