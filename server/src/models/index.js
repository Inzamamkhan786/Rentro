const User = require('./User');
const Vehicle = require('./Vehicle');
const Booking = require('./Booking');
const Document = require('./Document');
const SupportTicket = require('./SupportTicket');
const Message = require('./Message');

// Define associations
// User -> Vehicles (one-to-many)
User.hasMany(Vehicle, { foreignKey: 'owner_id', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User -> Bookings (one-to-many)
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Vehicle -> Bookings (one-to-many)
Vehicle.hasMany(Booking, { foreignKey: 'vehicle_id', as: 'bookings' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// User -> Documents (one-to-many)
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Vehicle -> Documents (one-to-many)
Vehicle.hasMany(Document, { foreignKey: 'vehicle_id', as: 'vehicleDocuments' });
Document.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Document -> Verified By User
Document.belongsTo(User, { foreignKey: 'verified_by_id', as: 'verifiedBy' });

// User -> SupportTickets
User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'supportTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Booking -> Messages
Booking.hasMany(Message, { foreignKey: 'booking_id', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User -> Messages
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

module.exports = {
  User,
  Vehicle,
  Booking,
  Document,
  SupportTicket,
  Message,
};
