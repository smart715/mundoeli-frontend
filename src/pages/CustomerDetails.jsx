/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useRef, useState } from 'react';
import { Form, Input, Row, Col, Tabs, Upload, Button, message, Modal, Statistic, PageHeader, } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CalendarTwoTone, InstagramOutlined, MailOutlined, PhoneFilled, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import { DashboardLayout } from '@/layout';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectReadItem } from '@/redux/crud/selectors';
import CustomerReservation from './CustomerReservation';
import CustomerPayment from './CustomerPayment';
import moment from 'moment';
import CustomerModal from './CustomerModal';
import defaultAvatar from '@/style/demo-avatar.jpg'
import { KTIcon } from '@/modules/Icons/KTIcon';
import Item from 'antd/lib/list/Item';
export default function Details() {
  const currentCustomerId = useParams().id;
  const entity = "client";
  const id = useParams().id;
  const dispatch = useDispatch();
  const { result: currentItem } = useSelector(selectReadItem);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isClickNewReserva, setIsClickNewReserva] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomerUpdate, setIsCustomerUpdate] = useState(false);
  const [customerObj, setCustomerObj] = useState();
  const [reversCount, setReversCount] = useState();
  const [reversPendingAmount, setReversPendingAmount] = useState();
  // const { pagination, items } = currentResult;
  const handleCustomerModal = () => {
    setIsOpen(false)
  }
  const handleCreateCustomer = () => {
    setIsOpen(true)
    setIsCustomerUpdate(false)
  }
  const handleIsClickNewReservaChange = (newValue) => {
    setIsClickNewReserva(newValue);
  };
  const handleReversationInfo = (reversations) => {
    if (reversations?.length) {
      var pendingAmount = 0, reserva_length = 0;
      for (var i = 0; i < reversations?.length; i++) {
        const obj = reversations[i];
        if (obj?.status === 1) {
          reserva_length++;
          pendingAmount += parseFloat(obj?.product_price || 0) - parseFloat(obj?.paid_amount || 0)
        }
      }
      setReversCount(reserva_length)

      setReversPendingAmount(pendingAmount);
    }
  }
  const changeStatus = (e) => {
    const id = currentCustomerId;
    dispatch(crud.update({ entity, id, jsonData: { status: e } }));
    setTimeout(() => {
      dispatch(crud.read({ entity, id }));
    }, 500)
    return true;
  }



  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const formRef = useRef(null);

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const editCustomer = () => {
    setIsOpen(true);
    setIsCustomerUpdate(true)
  }

  const formatDate = (date) => {
    date = date.$d;
    const day = date.getDate().toString().padStart(2, '0'); // padStart adds a zero if the length of the string is less than 2 characters
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // combine the day, month and year into a single string in mm/dd/yyyy format
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
  }
  const saveDetails = (values) => {
    console.log(values, 'valuesvalues')

    dispatch(crud.update({ entity, id, jsonData: values }));
    setTimeout(() => {
      dispatch(crud.read({ entity, id }));
    }, 500)
    setIsModalVisible(false)
  }
  useEffect(() => {
    dispatch(crud.read({ entity, id }));
  }, [entity, id]);

  const [fileList, setFileList] = useState([]);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );


  useEffect(() => {
    setCustomerObj(currentItem)
  }, [currentItem])
  const handleUpload = (file) => {

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('id', id);
    dispatch(crud.upload({ entity, jsonData: formData }));
    message.info(`Uploading ${file.name}...`);
    setTimeout(() => {
      dispatch(crud.read({ entity, id }));
    }, 500)
  };

  return (
    <DashboardLayout>
      <PageHeader title="Customer Info" onBack={() => { window['history'].back() }}
        extra={
          <a
            className='btn btn-sm btn-info me-3'
            data-bs-toggle='modal'
            data-bs-target='#kt_modal_offer_a_deal'
            onClick={handleCreateCustomer}
          >
            Create Customer
          </a>
        }
      ></PageHeader>
      <div className='card mb-5 mb-xl-10'>
        <div className='card-body pt-3 pb-0'>

          <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
            <div className='flex-grow-1'>
              <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
                <div className='d-flex flex-column'>
                  <div className='d-flex align-items-center mb-2'>
                    <a href='#test' className='text-gray-800 text-hover-primary fs-2 fw-bolder me-1'>
                      {currentItem?.name}
                    </a>
                    <a href='#'>
                      <KTIcon iconName={'verify'} className='fs-1 text-primary' />
                    </a>
                  </div>
                  <div className='d-flex flex-wrap fw-bold fs-6 mb-4 pe-2'>
                    <KTIcon iconName={'phone'} className='fs-1 text-default' />
                    <label className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'>
                      <a target="_blank" href={`https://web.whatsapp.com/send?l=es&phone=507${currentItem?.phone}`}>{currentItem?.phone}</a>
                    </label>
                    <KTIcon iconName={'instagram'} className='fs-1 text-default' />
                    <label
                      className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                    >
                      <a target="_blank" href={`https://www.instagram.com/${currentItem?.iguser}`}>{currentItem?.iguser}</a>
                    </label>
                    <KTIcon iconName={'sms'} className='fs-1 text-default' />
                    <label
                      className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                    >
                      <a target="_blank" href={`mailto:${currentItem?.email}`}>{currentItem?.email}</a>
                    </label>
                    <KTIcon iconName={'calendar-edit'} className='fs-1 text-default' />
                    <label
                      className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                    >
                      {moment(new Date(currentItem?.created)).format('DD/MM/YY')}
                    </label>
                  </div>
                </div>

                <div className='d-flex my-4'>
                  <a onClick={editCustomer} className='btn btn-sm btn-light me-2' id='kt_user_follow_button'>
                    <span className='indicator-label'>Edit</span>
                  </a>
                  <a
                    className='btn btn-sm btn-primary me-3'
                    data-bs-toggle='modal'
                    data-bs-target='#kt_modal_offer_a_deal'
                    onClick={() => setIsClickNewReserva(true)}
                  >
                    New Reserva
                  </a>
                </div>
              </div>

              <div className='d-flex flex-wrap flex-stack'>
                <div className='d-flex flex-column flex-grow-1 pe-8'>
                  <div className='d-flex flex-wrap'>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                      <div className='d-flex align-items-center'>
                        <div className='fs-2 fw-bolder'>{reversCount || 0}</div>
                      </div>

                      <div className='fw-bold fs-6 text-gray-500'>Reserva</div>
                    </div>

                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                      <div className='d-flex align-items-center'>
                        <div className='fs-2 fw-bolder'>{`$${parseFloat(reversPendingAmount || 0).toFixed(2) || 0}`}</div>
                      </div>

                      <div className='fw-bold fs-6 text-gray-500'>Pending</div>
                    </div>
                    {/* {console.log('%cfrontend\src\pages\CustomerDetails.jsx:216 object', 'color: #007acc;', currentItem?.notes)} */}
                    {currentItem?.notes != undefined ? <div className='w-450px border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                      <div className='fw-bold fs-6 text-gray-500'>{currentItem?.notes}</div>
                    </div> : null
                    }
                    {currentItem?.notes != undefined ? <div className='w-250px border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                      <div className='fw-bold fs-6 text-gray-500'>{currentItem?.address}</div>
                    </div> : null
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Tabs defaultActiveKey="1">
        <div tab="Reservations" key="1">
          <Modal title="Create Form" visible={isModalVisible} onCancel={handleCancel} footer={null}>
            <div className="profile-card">
              <Upload
                showUploadList={false}
                name='avatar'
                listType="picture-card"
                beforeUpload={handleUpload}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </div>
            <Form
              ref={formRef}
              name="basic"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              onFinish={saveDetails}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              initialValues={{
                gender: 1,
                civil_status: 3,
                birthplace: "AU",

              }}
            >
              <Form.Item
                name="name"
                label="Customer Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="legal_name"
                label="Legal Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="ruc"
                label="RUC"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="tax_residence"
                label="Tax residence"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="billing_details"
                label="Billing details"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                {

                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>

                }

                <Button type="ghost" onClick={handleCancel}>
                  cancel
                </Button>
              </Form.Item>
            </Form>
            <>
            </>
          </Modal>
          <CustomerModal isUpdate={isCustomerUpdate} isOpen={isOpen} parentId={currentCustomerId} handleCustomerModal={handleCustomerModal} customerInfo={currentItem} />
          <CustomerReservation isClicked={isClickNewReserva} setReversationInfo={handleReversationInfo} customerInfo={customerObj} parentId={currentCustomerId} onIsClickNewReservaChange={handleIsClickNewReservaChange}
          />
        </div>
        <div tab="Payments" key="2">
          <CustomerPayment isClicked={isClickNewReserva} setReversationInfo={handleReversationInfo} customerInfo={customerObj} parentId={currentCustomerId} onIsClickNewReservaChange={handleIsClickNewReservaChange} />
        </div>
      </Tabs>

    </DashboardLayout>
  );
}

