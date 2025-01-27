const User = require('../models/userModel')

const getPaginatedMembers = async (query, page = 1) => {
    let limit = 10
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
                        { memberId: { $regex: query, $options: 'i' } },
                    ],
                },
            ],
        };
    }

    const totalUsers = await User.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalUsers / limit);

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const currentPage = page;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);


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
    let limit = 10
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
                        { memberId: { $regex: query, $options: 'i' } },
                    ],
                },
            ],
        };
    }

    const totalUsers = await User.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalUsers / limit);

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const currentPage = page;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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


const getPaginatedHistory = async (history, page = 1, limit = 10) => {
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