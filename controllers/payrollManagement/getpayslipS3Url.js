const User = require('../../models/userModel');
const Payslip = require('../../models/paySlipModel');

const getpayslipUrl = async (req, res) => {
    try {
        const userId = req.body.userId;
        const month = req.body.month;
        const year = req.body.year;

        // Check if userId exists in the User model
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const payslip = await Payslip.findOne({ userId, month, year });

        if (!payslip) {
            return res.status(404).json({ error: 'Payslip not found, kindly contact HR' });
        }

        return res.json({ payslipUrl: payslip.s3Url });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error retrieving payslip S3 URL' });
    }
};

module.exports = {
    getpayslipUrl,
};
