const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

const COLLECTION_NAME = process.env.FIRESTORE_COLLECTION || 'contact_submissions';

/**
 * Saves a contact form submission to Firestore
 * @param {Object} submission - The contact submission data
 * @returns {Promise<string>} - The document ID of the saved submission
 */
async function saveContactSubmission(submission) {
  try {
    const collection = firestore.collection(COLLECTION_NAME);
    const docRef = await collection.add(submission);
    
    console.log(`Contact submission saved with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error saving contact submission to Firestore:', error);
    throw new Error('Failed to save contact submission');
  }
}

/**
 * Retrieves a contact submission by ID
 * @param {string} documentId - The document ID to retrieve
 * @returns {Promise<Object|null>} - The submission data or null if not found
 */
async function getContactSubmission(documentId) {
  try {
    const docRef = firestore.collection(COLLECTION_NAME).doc(documentId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error retrieving contact submission:', error);
    throw new Error('Failed to retrieve contact submission');
  }
}

/**
 * Updates the status of a contact submission
 * @param {string} documentId - The document ID to update
 * @param {string} status - New status ('new', 'read', 'responded')
 * @returns {Promise<void>}
 */
async function updateSubmissionStatus(documentId, status) {
  try {
    const docRef = firestore.collection(COLLECTION_NAME).doc(documentId);
    await docRef.update({
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Updated submission ${documentId} status to: ${status}`);
  } catch (error) {
    console.error('Error updating submission status:', error);
    throw new Error('Failed to update submission status');
  }
}

/**
 * Gets recent contact submissions with pagination
 * @param {number} limit - Number of submissions to retrieve (default: 10)
 * @param {string} startAfter - Document ID to start after for pagination
 * @returns {Promise<Array>} - Array of submissions
 */
async function getRecentSubmissions(limit = 10, startAfter = null) {
  try {
    let query = firestore.collection(COLLECTION_NAME)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    if (startAfter) {
      const startAfterDoc = await firestore.collection(COLLECTION_NAME).doc(startAfter).get();
      query = query.startAfter(startAfterDoc);
    }
    
    const snapshot = await query.get();
    const submissions = [];
    
    snapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return submissions;
  } catch (error) {
    console.error('Error retrieving recent submissions:', error);
    throw new Error('Failed to retrieve recent submissions');
  }
}

/**
 * Counts total submissions by status
 * @param {string} status - Status to count ('new', 'read', 'responded')
 * @returns {Promise<number>} - Count of submissions
 */
async function countSubmissionsByStatus(status) {
  try {
    const snapshot = await firestore.collection(COLLECTION_NAME)
      .where('status', '==', status)
      .get();
    
    return snapshot.size;
  } catch (error) {
    console.error('Error counting submissions by status:', error);
    throw new Error('Failed to count submissions');
  }
}

/**
 * Deletes old submissions (older than specified days)
 * @param {number} daysOld - Number of days old to delete
 * @returns {Promise<number>} - Number of deleted documents
 */
async function deleteOldSubmissions(daysOld = 365) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const snapshot = await firestore.collection(COLLECTION_NAME)
      .where('timestamp', '<', cutoffDate.toISOString())
      .get();
    
    const batch = firestore.batch();
    let count = 0;
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`Deleted ${count} old submissions`);
    }
    
    return count;
  } catch (error) {
    console.error('Error deleting old submissions:', error);
    throw new Error('Failed to delete old submissions');
  }
}

module.exports = {
  saveContactSubmission,
  getContactSubmission,
  updateSubmissionStatus,
  getRecentSubmissions,
  countSubmissionsByStatus,
  deleteOldSubmissions
};
