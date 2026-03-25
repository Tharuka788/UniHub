import React from 'react';
import { renderToString } from 'react-dom/server';
import PaymentForm from './src/components/PaymentForm/PaymentForm.jsx';
import PaymentHistory from './src/components/PaymentHistory/PaymentHistory.jsx';

try {
  console.log('Rendering PaymentForm...');
  renderToString(<PaymentForm />);
  console.log('PaymentForm rendered successfully!');
} catch (err) {
  console.error('PaymentForm Error:', err);
}

try {
  console.log('\nRendering PaymentHistory...');
  renderToString(<PaymentHistory />);
  console.log('PaymentHistory rendered successfully!');
} catch (err) {
  console.error('PaymentHistory Error:', err);
}
