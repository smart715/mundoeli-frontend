import React, { useRef, useState } from 'react';
import { Form, Input, InputNumber, Space, Divider, Row, Col } from 'antd';

import { Layout, Breadcrumb, Statistic, Progress, Tag } from 'antd';

import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

import { DashboardLayout } from '@/layout';
import RecentTable from '@/components/RecentTable';

const TopCard = ({ title, tagContent, tagColor, prefix }) => {
  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 12 }}
      md={{ span: 12 }}
      lg={{ span: 6 }}
    >
      <div className="whiteBox shadow" style={{ color: '#595959', fontSize: 13, height: '106px' }}>
        <div className="pad15 strong" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <h3 style={{ color: '#22075e', marginBottom: 0 }}>{title}</h3>
        </div>
        <Divider style={{ padding: 0, margin: 0 }}></Divider>
        <div className="pad15">
          <Row gutter={[0, 0]}>
            <Col className="gutter-row" span={11} style={{ textAlign: 'left' }}>
              <div className="left">{prefix}</div>
            </Col>
            <Col className="gutter-row" span={2}>
              <Divider
                style={{
                  padding: '10px 0',
                  justifyContent: 'center',
                }}
                type="vertical"
              ></Divider>
            </Col>
            <Col
              className="gutter-row"
              span={11}
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Tag
                color={tagColor}
                style={{
                  margin: '0 auto',
                  justifyContent: 'center',
                }}
              >
                {tagContent}
              </Tag>
            </Col>
          </Row>
        </div>
      </div>
    </Col>
  );
};
const PreviewState = ({ tag, color, value }) => {
  let colorCode = '#000';
  switch (color) {
    case 'bleu':
      colorCode = '#1890ff';
      break;
    case 'green':
      colorCode = '#95de64';
      break;
    case 'red':
      colorCode = '#ff4d4f';
      break;
    case 'orange':
      colorCode = '#ffa940';
      break;
    case 'purple':
      colorCode = '#722ed1';
      break;
    case 'grey':
      colorCode = '#595959';
      break;
    case 'cyan':
      colorCode = '#13c2c2';
      break;
    case 'brown':
      colorCode = '#614700';
      break;
    default:
      break;
  }
  return (
    <div style={{ color: '#595959', marginBottom: 5 }}>
      <div className="left alignLeft">{tag}</div>
      <div className="right alignRight">{value} %</div>
      <Progress
        percent={value}
        showInfo={false}
        strokeColor={{
          '0%': colorCode,
          '100%': colorCode,
        }}
      />
    </div>
  );
};
export default function Test() {
  const entity = 'invoice213';
  const dataTableColumns = [
    {
      title: 'N#',
      dataIndex: 'number',
    },
    {
      title: 'Client',
      dataIndex: ['client', 'company'],
    },

    {
      title: 'Total',
      dataIndex: 'total',

      render: (total) => `$ ${total}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'Draft' ? 'volcano' : 'green';

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];
  const config = { entity, dataTableColumns };

  return (
    <DashboardLayout>
      <Row gutter={[24, 24]}>
        <TopCard
          title={'Invoice'}
          tagColor={'cyan'}
          prefix={'This month'}
          tagContent={'34 000 $'}
        />
        <TopCard
          title={'Quote'}
          tagColor={'purple'}
          prefix={'This month'}
          tagContent={'34 000 $'}
        />
        <TopCard
          title={'Payment'}
          tagColor={'green'}
          prefix={'This month'}
          tagContent={'34 000 $'}
        />
        <TopCard
          title={'Due Balance'}
          tagColor={'red'}
          prefix={'Not Paid'}
          tagContent={'34 000 $'}
        />
      </Row>

    </DashboardLayout>
  );
}
