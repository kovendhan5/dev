// Mock Firestore
const mockDoc = {
  id: 'test-doc-id',
  data: () => ({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message',
    timestamp: '2025-06-14T10:30:00.000Z'
  }),
  exists: true,
  ref: 'mock-ref'
};

const mockDocRef = {
  id: 'test-doc-id',
  get: jest.fn().mockResolvedValue(mockDoc),
  update: jest.fn().mockResolvedValue()
};

const mockBatch = {
  delete: jest.fn(),
  commit: jest.fn().mockResolvedValue()
};

const mockCollection = {
  add: jest.fn().mockResolvedValue(mockDocRef),
  doc: jest.fn().mockReturnValue(mockDocRef),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  startAfter: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({
    docs: [mockDoc, mockDoc],
    forEach: jest.fn().mockImplementation(callback => {
      [mockDoc, mockDoc].forEach(callback);
    }),
    size: 2
  })
};

const mockFirestore = {
  collection: jest.fn().mockReturnValue(mockCollection),
  batch: jest.fn().mockReturnValue(mockBatch)
};

jest.mock('@google-cloud/firestore', () => ({
  Firestore: jest.fn().mockImplementation(() => mockFirestore)
}));

const { saveContactSubmission, getContactSubmission, updateSubmissionStatus, getRecentSubmissions, countSubmissionsByStatus, deleteOldSubmissions } = require('../../src/database');

describe('Database Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to success state
    mockCollection.add.mockResolvedValue(mockDocRef);
    mockDocRef.get.mockResolvedValue(mockDoc);
    mockDocRef.update.mockResolvedValue();
    mockCollection.get.mockResolvedValue({
      docs: [mockDoc, mockDoc],
      forEach: jest.fn().mockImplementation(callback => {
        [mockDoc, mockDoc].forEach(callback);
      }),
      size: 2
    });
  });

  describe('saveContactSubmission', () => {
    test('should save contact submission and return document ID', async () => {
      const submissionData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        timestamp: '2025-06-14T10:30:00.000Z'
      };

      const result = await saveContactSubmission(submissionData);

      expect(result).toBe('test-doc-id');
    });    test('should handle save errors', async () => {
      mockCollection.add.mockRejectedValueOnce(new Error('Firestore error'));

      const submissionData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      };

      await expect(saveContactSubmission(submissionData)).rejects.toThrow('Failed to save contact submission');
    });
  });

  describe('getContactSubmission', () => {
    test('should retrieve contact submission by ID', async () => {
      const result = await getContactSubmission('test-doc-id');

      expect(result).toEqual({
        id: 'test-doc-id',
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        timestamp: '2025-06-14T10:30:00.000Z'
      });
    });    test('should return null for non-existent document', async () => {
      mockDocRef.get.mockResolvedValueOnce({ exists: false });

      const result = await getContactSubmission('non-existent-id');

      expect(result).toBe(null);
    });

    test('should handle retrieval errors', async () => {
      mockDocRef.get.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(getContactSubmission('error-id')).rejects.toThrow('Failed to retrieve contact submission');
    });
  });

  describe('updateSubmissionStatus', () => {
    test('should update submission status', async () => {
      await expect(updateSubmissionStatus('test-doc-id', 'read')).resolves.not.toThrow();
    });    test('should handle update errors', async () => {
      mockDocRef.update.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(updateSubmissionStatus('error-id', 'read')).rejects.toThrow('Failed to update submission status');
    });
  });

  describe('getRecentSubmissions', () => {
    test('should retrieve recent submissions with default limit', async () => {
      const result = await getRecentSubmissions();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });    test('should handle query errors', async () => {
      mockCollection.get.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(getRecentSubmissions()).rejects.toThrow('Failed to retrieve recent submissions');
    });
  });

  describe('countSubmissionsByStatus', () => {
    test('should count submissions by status', async () => {
      const result = await countSubmissionsByStatus('new');

      expect(result).toBe(2);
    });    test('should handle count errors', async () => {
      mockCollection.get.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(countSubmissionsByStatus('new')).rejects.toThrow('Failed to count submissions');
    });
  });

  describe('deleteOldSubmissions', () => {    test('should delete old submissions and return count', async () => {
      mockCollection.get.mockResolvedValueOnce({
        docs: [
          { ref: 'doc1' },
          { ref: 'doc2' }
        ]
      });

      const result = await deleteOldSubmissions(365);

      expect(result).toBe(2);
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    test('should handle delete errors', async () => {
      mockCollection.get.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(deleteOldSubmissions(365)).rejects.toThrow('Failed to delete old submissions');
    });
  });
});
