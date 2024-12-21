const User = require('../models/userModel')
const PointsHistory = require('../models/pointsHistoryModel')

const getPaginatedMembers = async (query, page = 1) => {
    let limit = 5
    let usersToSkip = (page - 1) * limit
    let searchCriteria = { isAdmin: false }
    
    if (query) {
        searchCriteria = {
            $and: [
                { isAdmin: false },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                    ],
                },
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
        usersToShow,
        totalPages,
        prevPage,
        nextPage,
        currentPage,
        pages
    }
}

const getPaginatedAdmins = async (query, page = 1) => {
    let limit = 5
    let usersToSkip = (page - 1) * limit
    let searchCriteria = { isAdmin: true }
    
    if (query) {
        searchCriteria = {
            $and: [
                { isAdmin: true },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                    ],
                },
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
        usersToShow,
        totalPages,
        prevPage,
        nextPage,
        currentPage,
        pages
    }
}


const getPaginatedHistory = async (history, page = 1, limit = 5) => {
    let historiesToSkip = (page - 1) * limit;

    const totalHistories = history.length
    const totalPages = Math.ceil(totalHistories / limit);

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const currentPage = page;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const historiesToShow = history.slice(historiesToSkip, historiesToSkip + limit)

    return {
        historiesToShow,
        totalPages,
        prevPage,
        nextPage,
        currentPage,
        pages
    }
}

module.exports = {
    getPaginatedAdmins,
    getPaginatedMembers,
    getPaginatedHistory
}