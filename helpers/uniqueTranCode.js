const User = require('../models/userModel')

const generateUniqueCode = async () => {
    try {
        let uniqueTranCode
        let tranCodeExists
        let generatedNumber = 1

        do {
            let generatedCode = "DVTRN" + String(generatedNumber).padStart(3, '0')

            const tranCodesInTransaction = await User.aggregate([
                { $unwind: "$transaction" },
                { $project: { _id: 0, tranCode: "$transaction.tranCode" } }
            ])

            const tranCodesInRedeem = await User.aggregate([
                { $unwind: "$redeem" },
                { $project: { _id: 0, tranCode: "$redeem.tranCode" } }
            ])
    
            const tranCodeValuesInTransaction = tranCodesInTransaction.map(item => item.tranCode)
            const tranCodeValuesInRedeem = tranCodesInRedeem.map(item => item.tranCode)
            tranCodeExists = tranCodeValuesInTransaction.includes(generatedCode) || tranCodeValuesInRedeem.includes(generatedCode)
            
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
