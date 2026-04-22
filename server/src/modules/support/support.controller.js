const { SupportTicket, User } = require('../../models');

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description } = req.body;
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      subject,
      description,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    if (adminReply !== undefined) ticket.adminReply = adminReply;
    if (status !== undefined) ticket.status = status;
    
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};
