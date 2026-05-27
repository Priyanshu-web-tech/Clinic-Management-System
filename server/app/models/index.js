const mongoose = require("mongoose");

const db = {
  async transaction() {
    const session = await mongoose.startSession();
    session.startTransaction();

    session.commit = async () => {
      await session.commitTransaction();
      session.endSession();
    };

    session.rollback = async () => {
      await session.abortTransaction();
      session.endSession();
    };

    return session;
  },
};

module.exports = { db };