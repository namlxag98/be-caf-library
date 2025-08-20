export const getTransactionStatistics = async (filters = {}) => {
  try {
    const matchStage = {};

    // Apply filters
    if (filters.startDate && filters.endDate) {
      matchStage.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    const statistics = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: "$soTien" },
          averageAmount: { $avg: "$soTien" },
          minAmount: { $min: "$soTien" },
          maxAmount: { $max: "$soTien" },
        },
      },
    ]);

    // Get transaction counts by status
    const statusStats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$trangThai",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get daily transaction trends
    const dailyTrends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$soTien" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      overview: statistics[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
      },
      statusBreakdown: statusStats,
      dailyTrends,
    };
  } catch (error) {
    throw new Error(`Error getting transaction statistics: ${error.message}`);
  }
};
