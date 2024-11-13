const User = require('../models/userModel')

const generateUniqueCode = async () => {
    try {
        let uniqueTranCode
        let tranCodeExists
        let generatedNumber = 1

        do {
            let generatedCode = "DVTRN" + String(generatedNumber).padStart(3, '0')

            const tranCodes = await User.aggregate([
                { $unwind: "$transaction" },
                { $project: { _id: 0, tranCode: "$transaction.tranCode" } }
            ])
    
            const tranCodeValues = tranCodes.map(item => item.tranCode)
            tranCodeExists = tranCodeValues.includes(generatedCode)
            
            if (!tranCodeExists) {
                uniqueTranCode = generatedCode;
            }
            generatedNumber = generatedNumber + 1;  
        } while (tranCodeExists)

        return uniqueTranCode
    } catch (error) {
        console.error("Error in generating unique transaction code:", error); 
        throw error;
    }
};

module.exports = {
    generateUniqueCode
}
