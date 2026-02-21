const Cashier = require('../models/cashierModel');
const { v4: uuidv4 } = require('uuid');

const list = async (req, res) => {
  try {
    const rows = await Cashier.findAll();
    res.status(200).json({ cashiers: rows });
  } catch (err) {
    console.error('cashier list error', err);
    res.status(500).json({ message: 'Failed to list cashiers' });
  }
};

const get = async (req, res) => {
  try {
    const c = await Cashier.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) {
    console.error('cashier get error', err);
    res.status(500).json({ message: 'Failed to get cashier' });
  }
};

const create = async (req, res) => {
  try {
    const payload = req.body;
    payload.code = payload.code || ('cashier_'+uuidv4().slice(0,8));
    const row = await Cashier.create(payload);
    res.status(201).json(row);
  } catch (err) {
    console.error('cashier create error', err);
    res.status(500).json({ message: 'Failed to create cashier' });
  }
};

const update = async (req, res) => {
  try {
    const row = await Cashier.update(req.params.id, req.body);
    res.json(row);
  } catch (err) {
    console.error('cashier update error', err);
    res.status(500).json({ message: 'Failed to update cashier' });
  }
};

const remove = async (req, res) => {
  try {
    await Cashier.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('cashier remove error', err);
    res.status(500).json({ message: 'Failed to remove cashier' });
  }
};

module.exports = { list, get, create, update, remove };
