const sendMailMock = jest.fn().mockResolvedValue({ 
  messageId: 'mock-id' 
});

const createTransportMock = jest.fn().mockReturnValue({
  sendMail: sendMailMock,
});

module.exports = {
  createTransport: createTransportMock,
  sendMailMock,
};