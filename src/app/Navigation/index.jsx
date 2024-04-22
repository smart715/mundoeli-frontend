import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useSelector } from 'react-redux';

import { useAppContext } from '@/context/appContext';
import {
  SettingOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  FundProjectionScreenOutlined,
  ControlOutlined,
  LoginOutlined,
  CheckOutlined,
  UserOutlined,
  EditOutlined
} from '@ant-design/icons';

import history from '@/utils/history';
import photo from '@/style/LogoEli.jpg';
import shortPhoto from '@/style/shortEli.jpg'

const { Sider } = Layout;
const { SubMenu } = Menu;

export default function Navigation() {
  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const { is_admin, is_primary_company } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const [siderHeight, setSiderHeight] = useState(window.innerHeight - 48);
  useEffect(() => {
    const handleResize = () => {
      setSiderHeight(window.innerHeight - 48);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onCollapse = () => {
    navMenu.collapse();
  };
  return (
    <>
      <Sider collapsible collapsed={isNavMenuClose} onCollapse={onCollapse} className="navigation overflow-y-scroll" style={{ height: siderHeight }}>
        <div className="logo">
          <img
            src={isNavMenuClose ? shortPhoto : photo}
            alt="Logo"
            style={{ display: "block", width: '100%' }}
          />
        </div>
        <Menu mode="inline">
          <Menu.Item key={'Customer'} icon={<CustomerServiceOutlined />}>
            <Link to={'/customer'} />
            Customer
          </Menu.Item>
          <Menu.Item key={'Reservations'} icon={<ControlOutlined />}>
            <Link to={'/reservations'} />
            Reservations
          </Menu.Item>
          {is_primary_company ?
            <Menu.Item key={'RDCheckout'} icon={<MoneyCollectOutlined />}>
              <Link to={'/rd_checkout'} />
              RD-Checkout
            </Menu.Item> : null}
          {is_primary_company ?
            <Menu.Item key={'Payments'} icon={<MoneyCollectOutlined />}>
              <Link to={'/payments'} />
              Payments
            </Menu.Item> : null}
          <SubMenu key={'Reports'} icon={<SettingOutlined />} title={'Reports'}>
            <Menu.Item key={"DailyReport"} icon={<SettingOutlined />}>
              <Link to={'/daily_report'} />
              Daily Payments
            </Menu.Item>
            <Menu.Item key={"PaymentReport"} icon={<SettingOutlined />}>
              <Link to={'/payment_report'} />
              Weekly Payments
            </Menu.Item>
            <Menu.Item key={"Report1"} icon={<SettingOutlined />}>
              <Link to={'/report1'} />
              Annual Sales
            </Menu.Item>
            <Menu.Item key={'Report3'} icon={<FundProjectionScreenOutlined />}>
              <Link to={'/report3'} />
              Monthly Reports
            </Menu.Item>
          </SubMenu>
          <SubMenu key={'Settings'} icon={<SettingOutlined />} title={'Settings'}>
            {is_admin ? <Menu.Item key={"SystemInfo"} icon={<SettingOutlined />}>
              <Link to={'/system_info'} />
              SystemInfo
            </Menu.Item> : null}
            {is_admin ? <Menu.Item key={'Admin'} icon={<TeamOutlined />}>
              <Link to={'/admin'} />
              Users
            </Menu.Item> : null}
            <Menu.Item key={'Reserva Products'} icon={<FundProjectionScreenOutlined />}>
              <Link to={'/product_list'} />
              Reserva Products
            </Menu.Item>
            <Menu.Item key={'Checkout Products'} icon={<CheckOutlined />}>
              <Link to={'/product_list_checkout'} />
              Checkout Products
            </Menu.Item>
            <Menu.Item key={'Product Types'} icon={<FundProjectionScreenOutlined />}>
              <Link to={'/product_types'} />
              Product Types
            </Menu.Item>
            {is_admin ? <Menu.Item key={'company_list'} icon={<FundProjectionScreenOutlined />}>
              <Link to={'/company_list'} />
              Company
            </Menu.Item> : null}
            {is_admin ? <Menu.Item key={'Payment Method'} icon={<FundProjectionScreenOutlined />}>
              <Link to={'/payment_method'} />
              Payment Method
            </Menu.Item> : null}
          </SubMenu>
          <SubMenu key={'Profile'} icon={<UserOutlined />} title={'Profile'}>
            <Menu.Item key={`Edit`} icon={<EditOutlined />} onClick={() => history.push('/user_edit')}>
              Edit
            </Menu.Item>
            <Menu.Item key={`SignOut`} icon={<LoginOutlined />} onClick={() => history.push('/logout')}>
              Sign Out
            </Menu.Item>

          </SubMenu>
        </Menu>
      </Sider>
    </>
  );
}
