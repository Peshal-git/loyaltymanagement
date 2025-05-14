const User = require("../models/userModel");

const generateMemberId = async () => {
  try {
    let uniqueMemberId = null;
    let generatedNumber = 1;

    while (!uniqueMemberId) {
      const generatedId = `VKS-SA-${String(generatedNumber).padStart(4, "0")}`;
      const memberIdExists = await User.exists({ memberId: generatedId });

      if (!memberIdExists) {
        uniqueMemberId = generatedId;
      } else {
        generatedNumber++;
      }
    }

    return uniqueMemberId;
  } catch (error) {
    console.error("Error in generateMemberId:", error);
    throw error;
  }
};

module.exports = {
  generateMemberId,
};
