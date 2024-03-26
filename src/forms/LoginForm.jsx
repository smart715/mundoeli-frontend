import React, { useEffect, useState } from 'react';
import { Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import SelectAsync from '@/components/SelectAsync';

export default function LoginForm({ onStateChange, stateValue }) {


  return (
    <>
      {/* {
        isCompany &&
      } */}
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: 'Please input your Email!',
          },
        ]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="admin@demo.com"
          autoComplete="email"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder="admin123"
          size="large"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
          {/* <Checkbox checked={stateValue} onChange={(e) => onStateChange(e.target.checked)}>To Company</Checkbox> */}
        </Form.Item>


      </Form.Item>
    </>
  );
}
