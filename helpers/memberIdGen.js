const User = require('../models/userModel')
const { customAlphabet } = require('nanoid')

const generateMemberId = async () => {
    try {
        const generateNanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)
        const generateMemberId = "VKS" + generateNanoId()
        let uniqueMemberId;
        do {
            uniqueMemberId = generateMemberId;
            memberIdExists = await User.findOne({ memberId: uniqueMemberId });
        } while (memberIdExists);
        return uniqueMemberId
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    generateMemberId
}