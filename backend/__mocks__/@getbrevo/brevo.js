const mockSendTransacEmail = jest.fn().mockResolvedValue({
  messageId: 'mock-message-id-123',
});

class BrevoClient {
  constructor() {
    this.transactionalEmails = {
      sendTransacEmail: mockSendTransacEmail,
    };
  }
}

module.exports = { BrevoClient, mockSendTransacEmail };