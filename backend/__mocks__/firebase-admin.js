const mockVerifyIdToken = jest.fn();
const mockDeleteUser = jest.fn();

module.exports = {
  auth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
    deleteUser: mockDeleteUser,
  })),
  mockVerifyIdToken,
  mockDeleteUser,
};