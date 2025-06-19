import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Jan', invoices: 120 },
  { month: 'Feb', invoices: 90 },
  { month: 'Mar', invoices: 150 },
  { month: 'Apr', invoices: 110 },
  { month: 'May', invoices: 170 },
];

const InvoiceChart = () => {
  return (
    <div style={{ width: '100%', height: 300, marginTop: '3rem' }}>
      <h3 style={{ textAlign: 'center', color: '#fff' }}>Monthly Invoice Summary</h3>
      <ResponsiveContainer width="90%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="invoices" stroke="#4CAF50" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvoiceChart;
