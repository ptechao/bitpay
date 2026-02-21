const ChannelModel = require('../models/channelModel');

const getPaymentConfig = async (req, res) => {
  try {
    const channels = await ChannelModel.findAll();
    res.status(200).json({ channels });
  } catch (err) {
    console.error('admin getPaymentConfig error', err);
    res.status(500).json({ message: 'Failed to get payment config' });
  }
};

const getCashierList = async (req, res) => {
  try {
    // No cashier table present; return demo data or empty
    const demo = [
      { id: 'demo-cashier-1', name: 'Demo Cashier 1', status: 'active' }
    ];
    res.status(200).json({ cashiers: demo });
  } catch (err) {
    console.error('admin getCashierList error', err);
    res.status(500).json({ message: 'Failed to get cashier list' });
  }
};

module.exports = {
  getPaymentConfig,
  getCashierList
};
