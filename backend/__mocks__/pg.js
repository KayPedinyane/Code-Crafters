const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn();

const Pool = jest.fn(() => ({
  query: mockQuery,
  connect: mockConnect.mockResolvedValue({
    query: mockQuery,
    release: mockRelease,
  }),
  end: jest.fn(),
}));

module.exports = { Pool, mockQuery, mockRelease, mockConnect };