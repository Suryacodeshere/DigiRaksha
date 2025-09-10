import fraudDB from '../services/fraudDatabase';

// Function to add some sample reports for demonstration
export const addSampleReports = () => {
  try {
    // Add a few sample reports to demonstrate the system
    const sampleReports = [
      {
        identifier: 'testmerchant@paytm',
        reportData: {
          reportedBy: 'demo_user@example.com',
          description: 'Test report - Merchant charged extra amount without consent',
          amount: 1500,
          severity: 3,
          category: 'payment_fraud'
        }
      },
      {
        identifier: 'phone_8888888888',
        reportData: {
          reportedBy: 'demo_user2@example.com', 
          description: 'Test report - Fake call claiming to be from bank, asked for PIN',
          amount: 0,
          severity: 4,
          category: 'phone_fraud'
        }
      }
    ];

    sampleReports.forEach(({ identifier, reportData }) => {
      fraudDB.addFraudReport(identifier, reportData);
    });

    console.log('Sample reports added to demonstrate functionality');
  } catch (error) {
    console.error('Error adding sample reports:', error);
  }
};

export default { addSampleReports };
