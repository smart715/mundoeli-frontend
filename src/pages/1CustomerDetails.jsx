import React, { useRef, useState } from 'react';
import { Form, Input, InputNumber, Space, Divider, Row, Col, Tabs, Upload, message, Avatar, Button } from 'antd';

import { Layout, Breadcrumb, Statistic, Progress, Tag } from 'antd';

import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

import { DashboardLayout } from '@/layout';
import RecentTable from '@/components/RecentTable';
import { Content } from 'antd/lib/layout/layout';


export default function CustomerDetails() {
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
  const bankColumns = [
    {
      title: 'Bank',
      dataIndex: 'number',
    },
    {
      title: 'Account type',
      dataIndex: ['client', 'company'],
    },

    {
      title: 'Name',
      dataIndex: 'total',

      render: (total) => `$ ${total}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    },
    {
      title: 'Account No',
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'Draft' ? 'volcano' : 'green';

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];
  const relatedColumns = [
    {
      title: 'Name',
      dataIndex: 'number',
    },
    {
      title: 'Last Name',
      dataIndex: ['client', 'company'],
    },

    {
      title: 'Relation',
      dataIndex: 'total',

      render: (total) => `$ ${total}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    },
    {
      title: 'Contact',
      dataIndex: 'status',
      render: (status) => {
        let color = status === 'Draft' ? 'volcano' : 'green';

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Address',
      dataIndex: 'total',

      render: (total) => `$ ${total}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    },
  ];
  const emergencyColumns = [
    {
      title: 'Name',
      dataIndex: 'number',
    },
    {
      title: 'Last Name',
      dataIndex: ['client', 'company'],
    },

    {
      title: 'Phone',
      dataIndex: 'total',

      render: (total) => `$ ${total}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    },
  ];
  const medicalColumns = [
    {
      title: 'Type',
      dataIndex: 'number',
    },
    {
      title: 'Description',
      dataIndex: ['client', 'company'],
    },
  ];
  const contractColumns = [
    {
      title: 'Start',
      dataIndex: 'number',
    },
    {
      title: 'End',
      dataIndex: 'number',
    },
    {
      title: 'Sal/Hr',
      dataIndex: 'number',
    },
    {
      title: 'Hr/Week',
      dataIndex: 'number',
    },
    {
      title: 'Sal/Monthly',
      dataIndex: ['client', 'company'],
    },
    {
      title: 'status',
      dataIndex: ['client', 'company'],
    },
  ];
  const contactsColumns = [
    {
      title: 'Name',
      dataIndex: 'number',
    },
    {
      title: 'Position',
      dataIndex: 'number',
    },
    {
      title: 'Email',
      dataIndex: 'number',
    },
    {
      title: 'Phone',
      dataIndex: 'number',
    },

  ];
  const scheduleColumns = [
    {
      title: 'Hours',
      dataIndex: 'number',
    },
    {
      title: 'Monday',
      dataIndex: 'number',
    },
    {
      title: 'Tuesday',
      dataIndex: 'number',
    },
    {
      title: 'Wednesday',
      dataIndex: 'number',
    },
    {
      title: 'Tursday',
      dataIndex: ['client', 'company'],
    },
    {
      title: 'Friday',
      dataIndex: ['client', 'company'],
    },
    {
      title: 'Saturday',
      dataIndex: ['client', 'company'],
    },
    {
      title: 'Sunday',
      dataIndex: ['client', 'company'],
    },
  ];
  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'number',
    },
    {
      title: 'Fortnight',
      dataIndex: 'number',
    },
    {
      title: 'Total Amount',
      dataIndex: 'number',
    },
    {
      title: 'Net Amount',
      dataIndex: 'number',
    },
  ];
  const storesColumns = [
    {
      title: 'Store',
      dataIndex: 'number',
    },
    {
      title: 'Hours',
      dataIndex: 'number',
    },
    {
      title: 'Hr/week',
      dataIndex: 'number',
    },
    {
      title: 'Location',
      dataIndex: 'number',
    },
    {
      title: 'Billing',
      dataIndex: 'number',
    },
    {
      title: 'Products',
      dataIndex: 'number',
    },
  ];
  const assignedEmployeeColumns = [
    {
      title: 'Name',
      dataIndex: 'number',
    },
    {
      title: 'Branch',
      dataIndex: 'number',
    },
    {
      title: 'Time',
      dataIndex: 'number',
    },
    {
      title: 'Hr/week',
      dataIndex: 'number',
    },
    {
      title: 'Type',
      dataIndex: 'number',
    },
    {
      title: 'Sal/hr',
      dataIndex: 'number',
    },
  ];
  const documentsColumns = [
    {
      title: 'Name',
      dataIndex: 'number',
    },
    {
      title: 'Date',
      dataIndex: 'number',
    },
    {
      title: 'Comments',
      dataIndex: 'number',
    },
    {
      title: 'By',
      dataIndex: 'number',
    },
  ];
  const recurrentBillingColumns = [
    {
      title: 'Description',
      dataIndex: 'number',
    },
    {
      title: 'Amount',
      dataIndex: 'number',
    },
    {
      title: 'taxes',
      dataIndex: 'number',
    },
    {
      title: 'Frequency',
      dataIndex: 'number',
    },
    {
      title: 'Start',
      dataIndex: 'number',
    },
    {
      title: 'End',
      dataIndex: 'number',
    },
  ];
  const InvoiceHistoryColumns = [
    {
      title: 'Date',
      dataIndex: 'number',
    },
    {
      title: 'Description',
      dataIndex: 'number',
    },
    {
      title: 'Amount',
      dataIndex: 'number',
    },
    {
      title: 'Details',
      dataIndex: 'number',
    },
  ];
  const BillingEstimationColumns = [
    {
      title: 'Month',
      dataIndex: 'number',
    },
    {
      title: 'Amount',
      dataIndex: 'number',
    },
  ];
  const [form] = Form.useForm();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [phone, setPhone] = useState('123-456-7890');
  const [avatar, setAvatar] = useState('');

  const onFinish = (values) => {
    setName(values.name);
    setEmail(values.email);
    setPhone(values.phone);
    setAvatar(values.avatar);
    message.success('Profile updated successfully!');
  };
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }

    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info) => {

    console.log(info, 'dfinfo')
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl) =>
        setAvatar(imageUrl),
      );
    }
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  return (
    <DashboardLayout>
      <Tabs defaultActiveKey="1">
        <div tab="Details" key="1">
          <Content style={{ padding: '0 0px' }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <div className="profile-card">
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                  >
                    {avatar ? <Avatar shape="circle" src={avatar} size={128} /> : <UserOutlined style={{ fontSize: '44px' }} />}
                    <div style={{ marginTop: 8 }}>Change Avatar</div>
                  </Upload>
                </div>
              </Col>
              <Col span={18}>
                <p>Name:{name}</p>
                <p>Personal ID:{name}</p>
                <p>Phone:{phone}</p>
                <p>Email:{email}</p>
              </Col>
            </Row>
            <div className="profile-details">
              <h2>Edit Details</h2>
              <Form form={form} onFinish={onFinish}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input your name' }]}
                  initialValue={name}
                >
                  <Input prefix={<UserOutlined />} placeholder="Name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Please input your email!' }]}
                  initialValue={email}
                >
                  <Input prefix={<MailOutlined />} type="email" placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: 'Please input your phone number!' }]}
                  initialValue={phone}
                >
                  <Input prefix={<PhoneOutlined />} type="tel" placeholder="Phone Number" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Save Chang es</Button>
                </Form.Item>
              </Form>
            </div>

          </Content>
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Contacts</h3>
            </div>

            <RecentTable entity={'banks'} dataTableColumns={contactsColumns} />
          </div>

          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Stores</h3>
            </div>
            <RecentTable entity={'quote'} dataTableColumns={storesColumns} />
          </div>

          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Assigned Employees</h3>
            </div>
            <RecentTable entity={'quote'} dataTableColumns={assignedEmployeeColumns} />
          </div>

        </div>
        <div tab="Documentes" key="2">
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Documents</h3>
            </div>

            <RecentTable entity={'invoice'} dataTableColumns={documentsColumns} />
          </div>
        </div>
        <div tab="Biling" key="3">
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Recurrent Billing</h3>
            </div>

            <RecentTable entity={'invoice'} dataTableColumns={recurrentBillingColumns} />
          </div>
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Invoice History</h3>
            </div>

            <RecentTable entity={'invoice'} dataTableColumns={InvoiceHistoryColumns} />
          </div>
          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Billing Estimation</h3>
            </div>

            <RecentTable entity={'invoice'} dataTableColumns={BillingEstimationColumns} />
          </div>
        </div>
      </Tabs>

    </DashboardLayout>
  );
}
