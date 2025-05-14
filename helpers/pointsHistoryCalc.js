const PointsHistory = require("../models/pointsHistoryModel");

const addPoints = async (
  userId,
  points,
  totalPointsBefore,
  service,
  tranCode
) => {
  const newTransaction = new PointsHistory({
    userId,
    transactionType: "add",
    points,
    totalPointsBefore,
    totalPointsAfter: totalPointsBefore + points,
    service,
    tranCode,
  });

  await newTransaction.save();
};

const subtractPoints = async (
  userId,
  points,
  totalPointsBefore,
  service,
  tranCode
) => {
  const newTransaction = new PointsHistory({
    userId,
    transactionType: "subtract",
    points,
    totalPointsBefore,
    totalPointsAfter: totalPointsBefore - points,
    service,
    tranCode,
  });

  await newTransaction.save();
};

const editPointsRecord = async (tranCode, newPoints) => {
  const record = await PointsHistory.findOne({ tranCode });
  const recordId = record.id;

  if (!record) throw new Error("Record not found");

  const pointDifference = newPoints - record.points;

  const updatedRecord = await PointsHistory.findByIdAndUpdate(
    recordId,
    {
      points: newPoints,
      totalPointsAfter: record.totalPointsBefore + newPoints,
    },
    { new: true }
  );

  await PointsHistory.updateMany(
    { userId: record.userId, transactionDate: { $gt: record.transactionDate } },
    {
      $inc: {
        totalPointsBefore: pointDifference,
        totalPointsAfter: pointDifference,
      },
    }
  );
};

const deletePointsRecord = async (tranCode) => {
  const record = await PointsHistory.findOne({ tranCode });
  const recordId = record.id;

  if (!record) throw new Error("Record not found");

  const pointDifference = -record.points || 0;

  const deletedRecord = await PointsHistory.findByIdAndDelete(recordId);

  await PointsHistory.updateMany(
    { userId: record.userId, transactionDate: { $gt: record.transactionDate } },
    {
      $inc: {
        totalPointsBefore: pointDifference,
        totalPointsAfter: pointDifference,
      },
    }
  );
};

module.exports = {
  addPoints,
  subtractPoints,
  editPointsRecord,
  deletePointsRecord,
};
