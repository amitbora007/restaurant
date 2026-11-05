import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Backward-compatibility wrapper for /checkout.
 * Redirects diner to the in-page checkout drawer on /cart.
 */
const Checkout = () => {
  return <Navigate to="/cart?checkout=true" replace />;
};

export default Checkout;