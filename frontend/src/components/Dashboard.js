import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Welcome to Dashboard</h1>
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>Getting Started</h2>
        <p>Sprint 1 is complete! You have successfully:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>✅ Set up the application architecture</li>
          <li>✅ Implemented user registration and login</li>
          <li>✅ Connected to the database</li>
          <li>✅ Set up authentication system</li>
        </ul>
        <p style={{ marginTop: '20px' }}>
          Next steps: Sprint 2 will focus on Task Management features!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;