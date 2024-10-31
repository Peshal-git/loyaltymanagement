const User = require('../models/userModel')
const { customAlphabet } = require('nanoid')

const generateMemberId = async () => {
    try {
        const generateNanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8); // Creates a new ID generator
        let uniqueMemberId;
        let memberIdExists;

        do {
            const generatedId = "VKS" + generateNanoId();
            memberIdExists = await User.findOne({ memberId: generatedId });
            
            if (!memberIdExists) uniqueMemberId = generatedId;
        } while (memberIdExists);

        return uniqueMemberId;
    } catch (error) {
        console.error("Error in generateMemberId:", error); 
        throw error;
    }
};

module.exports = {
    generateMemberId
}