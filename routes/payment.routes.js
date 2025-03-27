const express = require('express');
const router = express.Router();
const { Payment } = require('../models'); // Adjust the path as necessary
const { Op } = require('sequelize');
const sequelize = require('sequelize'); // Ensure sequelize is imported

// Endpoint to get cumulative revenue by month
router.get('/cumulative-revenue', async (req, res) => {
   try {
     const revenueData = await Payment.findAll({
       attributes: [
         [sequelize.fn('DATE_FORMAT', sequelize.col('paymentDate'), '%Y-%m-01'), 'month'],
         [sequelize.fn('SUM', sequelize.col('paymentAmount')), 'totalRevenue']
       ],
       where: {
         paymentDate: {
           [Op.lt]: new Date() // Filter out future dates
         }
       },
       group: ['month'],
       order: [['month', 'ASC']]
     });

     const formattedData = revenueData.map(item => ({
       month: new Date(item.get('month')).toLocaleString('default', { month: 'short', year: 'numeric' }),
       value: parseFloat(item.get('totalRevenue'))
     }));

     res.json({ success: true, data: formattedData });
   } catch (error) {
     console.error('Error fetching cumulative revenue:', error.message);
     console.error('Stack Trace:', error.stack);

     res.status(500).json({ 
       success: false, 
       message: 'Internal server error',
       error: error.message 
     });
   }
});

module.exports = router;