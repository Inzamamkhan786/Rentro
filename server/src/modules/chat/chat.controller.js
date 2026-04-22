const { Message, Booking, User, Vehicle } = require('../../models');

exports.getMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['owner_id'] }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify user is either the consumer or the provider
    if (booking.userId !== req.user.id && booking.vehicle.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat' });
    }

    const messages = await Message.findAll({
      where: { bookingId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role', 'avatar'] }
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['owner_id'] }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Identify receiver
    let receiverId = null;
    if (req.user.id === booking.userId) {
      receiverId = booking.vehicle.owner_id;
    } else if (req.user.id === booking.vehicle.owner_id) {
      receiverId = booking.userId;
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this chat' });
    }

    const message = await Message.create({
      bookingId,
      senderId: req.user.id,
      receiverId,
      content,
    });

    // Fetch the fully populated message to return
    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role', 'avatar'] }
      ]
    });

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};
