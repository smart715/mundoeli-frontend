import React from 'react';

import { Layout } from 'antd';

const { Content } = Layout;

export default function DashboardLayout({ children }) {
  return (
    <Layout className="site-layout">
      <Content
        style={{
          padding: '0px 40px',
          height:'100vh'
          // width: '100%',
          // height: "500px !important ",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}
  