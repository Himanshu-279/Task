const Task = require('../models/Task.model');

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};

exports.getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const tasks = await Task.find(filter).populate('owner', 'name email');
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};
