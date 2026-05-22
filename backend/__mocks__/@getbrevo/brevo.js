module.exports = {
  BrevoClient: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn().mockResolvedValue({ 
      success: true,
      messageId: 'mock-message-id' 
    }),
  })),
};