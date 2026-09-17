function paginate(req, defaultLimit = 20, maxLimit = 100) {
  let page = Math.max(1, parseInt(req.query.page) || 1);
  let limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginatedResponse(rows, total, page, limit) {
  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

module.exports = { paginate, paginatedResponse };
