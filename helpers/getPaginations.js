const User = require("../models/userModel");

const getPaginatedMembers = async (query, page = 1) => {
  const limit = 50;

  const searchCriteria = query
    ? {
        $and: [
          { isAdmin: false },
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
              { memberId: { $regex: query, $options: "i" } },
            ],
          },
        ],
      }
    : { isAdmin: false };

  const options = {
    page,
    limit,
    sort: { createdAt: -1 },
    lean: true,
  };

  const result = await User.paginate(searchCriteria, options);

  return {
    usersToShow: result.docs,
    totalPages: result.totalPages,
    prevPage: result.hasPrevPage ? result.prevPage : null,
    nextPage: result.hasNextPage ? result.nextPage : null,
    currentPage: result.page,
    pages: Array.from({ length: result.totalPages }, (_, i) => i + 1),
  };
};

const getPaginatedAdmins = async (query, page = 1) => {
  const limit = 10;

  const searchCriteria = query
    ? {
        $and: [
          { isAdmin: true },
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
              { memberId: { $regex: query, $options: "i" } },
            ],
          },
        ],
      }
    : { isAdmin: true };

  const options = {
    page,
    limit,
    lean: true,
  };

  const result = await User.paginate(searchCriteria, options);

  return {
    usersToShow: result.docs,
    totalPages: result.totalPages,
    prevPage: result.hasPrevPage ? result.prevPage : null,
    nextPage: result.hasNextPage ? result.nextPage : null,
    currentPage: result.page,
    pages: Array.from({ length: result.totalPages }, (_, i) => i + 1),
  };
};

const getPaginatedHistory = async (history, page = 1, limit = 10) => {
  let historiesToSkip = (page - 1) * limit;

  const totalHistories = history.length;
  const totalPages = Math.ceil(totalHistories / limit);

  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const currentPage = page;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const historiesToShow = history.slice(
    historiesToSkip,
    historiesToSkip + limit
  );

  return {
    historiesToShow,
    totalPages,
    prevPage,
    nextPage,
    currentPage,
    pages,
  };
};

module.exports = {
  getPaginatedAdmins,
  getPaginatedMembers,
  getPaginatedHistory,
};
