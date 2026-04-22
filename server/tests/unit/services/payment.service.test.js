const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestBooking } = require('../../helpers/testHelpers');
const paymentService = require('../../../src/modules/payments/payment.service');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Payment Service', () => {
  let consumer, provider, vehicle, booking;

  beforeEach(async () => {
    const cRes = await createTestUser({ role: 'consumer' });
    consumer = cRes.user;
    const pRes = await createTestUser({ role: 'provider' });
    provider = pRes.user;
    vehicle = await createTestVehicle(provider.id);
    booking = await createTestBooking(consumer.id, vehicle.id);
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent', async () => {
      const result = await paymentService.createPaymentIntent(booking.id, consumer.id);
      expect(result.paymentIntentId).toBeDefined();
      expect(result.clientSecret).toBeDefined();
      expect(result.amount).toBe(300000);
      expect(result.currency).toBe('inr');
    });

    it('should throw for non-existent booking', async () => {
      await expect(paymentService.createPaymentIntent(99999, consumer.id))
        .rejects.toThrow('Booking not found');
    });

    it('should prevent paying for others booking', async () => {
      await expect(paymentService.createPaymentIntent(booking.id, provider.id))
        .rejects.toThrow('You can only pay for your own bookings');
    });

    it('should prevent double payment', async () => {
      await booking.update({ paymentStatus: 'paid' });
      await expect(paymentService.createPaymentIntent(booking.id, consumer.id))
        .rejects.toThrow('Booking is already paid');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const intent = await paymentService.createPaymentIntent(booking.id, consumer.id);
      const result = await paymentService.confirmPayment(intent.paymentIntentId, consumer.id);
      expect(result.status).toBe('succeeded');
    });

    it('should throw for unknown payment', async () => {
      await expect(paymentService.confirmPayment('pi_unknown', consumer.id))
        .rejects.toThrow('Booking not found');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      const intent = await paymentService.createPaymentIntent(booking.id, consumer.id);
      const status = await paymentService.getPaymentStatus(intent.paymentIntentId);
      expect(status.paymentId).toBeDefined();
      expect(status.status).toBeDefined();
    });

    it('should throw for missing payment ID', async () => {
      await expect(paymentService.getPaymentStatus('')).rejects.toThrow('Payment ID is required');
    });
  });

  describe('processRefund', () => {
    it('should process a full refund', async () => {
      const intent = await paymentService.createPaymentIntent(booking.id, consumer.id);
      await paymentService.confirmPayment(intent.paymentIntentId, consumer.id);
      const refund = await paymentService.processRefund(booking.id, provider.id);
      expect(refund.refundId).toBeDefined();
      expect(refund.status).toBe('succeeded');
    });

    it('should throw for booking without payment', async () => {
      await expect(paymentService.processRefund(booking.id, provider.id))
        .rejects.toThrow('No payment found for this booking');
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history', async () => {
      await paymentService.createPaymentIntent(booking.id, consumer.id);
      const result = await paymentService.getPaymentHistory(consumer.id, {});
      expect(result.payments.length).toBe(1);
    });

    it('should return empty for user with no payments', async () => {
      const result = await paymentService.getPaymentHistory(provider.id, {});
      expect(result.payments.length).toBe(0);
    });
  });

  describe('generateInvoice', () => {
    it('should generate an invoice', async () => {
      const invoice = await paymentService.generateInvoice(booking.id);
      expect(invoice.invoiceNumber).toBeDefined();
      expect(invoice.bookingId).toBe(booking.id);
      expect(invoice.amount).toBe(3000);
    });

    it('should throw for non-existent booking', async () => {
      await expect(paymentService.generateInvoice(99999)).rejects.toThrow('Booking not found');
    });
  });

  describe('getEarnings', () => {
    it('should return provider earnings', async () => {
      await booking.update({ paymentStatus: 'paid', status: 'completed' });
      const earnings = await paymentService.getEarnings(provider.id, {});
      expect(earnings.totalEarnings).toBe(3000);
      expect(earnings.bookingCount).toBe(1);
    });

    it('should return zero for provider with no bookings', async () => {
      const { user: newProvider } = await createTestUser({ role: 'provider' });
      const earnings = await paymentService.getEarnings(newProvider.id, {});
      expect(earnings.totalEarnings).toBe(0);
    });
  });
});
