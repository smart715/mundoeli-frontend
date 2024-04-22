import React from 'react';

import Router from '@/router';


import { Layout } from 'antd';

import Navigation from '@/app/Navigation';

import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import '../../src/_metronic/assets/sass/style.react.scss'
import '../../src/_metronic/assets/keenicons/duotone/style.css'
import '../../src/_metronic/assets/keenicons/outline/style.css'
import '../../src/_metronic/assets/keenicons/solid/style.css'
import '../../src/_metronic/assets/sass/style.scss'
document.documentElement.setAttribute("data-bs-theme", "light")

function App() {
  const { isLoggedIn } = useSelector(selectAuth);
  if (!isLoggedIn) return <Router />;
  else {
    return (
      <Layout>
        <Navigation />
        <Layout>
          {/* <HeaderContent /> */}
          <Router isLoggedIn={true} />
        </Layout>
      </Layout>
    );
  }
}

export default App;
