import React from 'react';
import { motion } from 'framer-motion';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ component: Component, type, ...rest }) => {
  const { is_admin, is_primary_company } = useSelector((state) => state.auth);
  const config = {
    type: 'spring',
    damping: 20,
    stiffness: 100,
  };

  return (
    // Show the component only when the admin is logged in
    // Otherwise, redirect the admin to /signin page

    <Route
      {...rest}
      render={(props) =>
        window.localStorage.getItem('isLoggedIn') ? (
          (type === 0 || (type === 1 && is_admin) || (type === 2 && is_primary_company)) ? (
            <motion.div
              transition={config}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <Component {...props} />
            </motion.div>
          ) : <Redirect to="/" />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
