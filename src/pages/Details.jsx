import React, { useRef, useState } from 'react';
import { Form, Input, Row, Col, Tabs, Upload, Button, message, Select, Modal, Radio, Avatar, Image, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import countryList from 'country-list'
import { DashboardLayout } from '@/layout';
import RecentTable from '@/components/RecentTable';
import { Content } from 'antd/lib/layout/layout';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectReadItem } from '@/redux/crud/selectors';
import { DatePicker } from '@/components/CustomAntd';
import BankAccount from './BankAccount';
import RelatedPeople from './RelatedPeople';
import EmergencyContact from './EmergencyContact';
import MedicalDetail from './MedicalDetail';
import Contract from './Contract';
import AssignedCustomer from './AssignedCustomer';
import { Avatar_url } from '@/config/serverApiConfig';
import EmployeeDocumentManage from './EmployeeDocumentManage';
import Schedule from './Schedule';


export default function Details() {


  const customerColumns = [
    {
      title: 'Customer',
      dataIndex: 'number',
    },
    {
      title: 'Store',
      dataIndex: 'number',
    },
    {
      title: 'Hours',
      dataIndex: 'number',
    },
    {
      title: 'Hr/Week',
      dataIndex: 'number',
    },
    {
      title: 'Sal/Hr',
      dataIndex: ['client', 'company'],
    },
    {
      title: 'Type',
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
  const genderOptions = [
    {
      label: "Men", value: 1,
    },
    {
      label: "Women", value: 2,
    },
  ]
  const civilOptions = [
    {
      label: "Soltero", value: 1
    },
    {
      label: "Casado", value: 2
    },
    {
      label: "Unido", value: 3
    },
    {
      label: "Separado", value: 4
    },
  ]
  const statusOptions = [
    {
      label: "Active", value: 1,
    },
    {
      label: "InActive", value: 2,
    }
    ,
    {
      label: "reject", value: 3,
    }
  ]
  const [form] = Form.useForm();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [phone, setPhone] = useState('123-456-7890');
  const [avatar, setAvatar] = useState('');
  const currentEmployeeId = useParams().id;

  const entity = "employee";
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



  const id = useParams().id;
  const dispatch = useDispatch();
  const { result: currentItem } = useSelector(selectReadItem);


  useEffect(() => {
    dispatch(crud.resetState())
    dispatch(crud.read({ entity, id }));
  }, [entity, id]);

  const [isModalVisible, setIsModalVisible] = useState(false);


  // const currentItem = _currentItem || {
  //   gender: 1
  // }

  // const { pagination, items } = currentResult;
  const changeStatus = (e) => {
    const id = currentEmployeeId;
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
  const editModal = () => {
    if (formRef.current)
      console.log(formRef.current.getFieldValue(), 'formRef.current')
    //formRef.current.setFieldsValue(currentItem);

    setIsModalVisible(true)
    setTimeout(() => {

      formRef.current.setFieldsValue({
        gender: currentItem.gender,
        address: currentItem.address,
        birthplace: currentItem.birthplace,
        civil_status: currentItem.civil_status,
        school: currentItem.school,
        // birthday:moment(new Date(currentItem.birthday),'mm/dd/yyyy')
      })
    }, 600)
  }
  const onChange = (value) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value) => {
    // const id = 

    console.log('search:', value);
  };

  const countryLists = countryList.getData().map((item) => ({
    value: item.code,
    label: item.name
  }))
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
    values['birthday'] = formatDate(values['birthday']);
    dispatch(crud.update({ entity, id, jsonData: values }));
    setTimeout(() => {
      dispatch(crud.read({ entity, id }));
    }, 500)
    setIsModalVisible(false)
  }


  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState([]);


  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
  const handlePreviewImageCancel = () => {
    setPreviewVisible(false);
  }
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
  const props = {
    name: 'avatar',
    action: 'http://localhost:8888/employee/details', // replace with your backend API endpoint
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  return (
    <DashboardLayout>
      <Tabs defaultActiveKey="1">
        <div tab="Details" key="1">
          <Modal title="Create Form" open={isModalVisible} onCancel={handleCancel} footer={null}>
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
                name="gender"
                label="Gender"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Radio.Group name="radiogroup" options={genderOptions} />
              </Form.Item>
              <Form.Item
                name="birthplace"
                label="Birthplace"
              >
                <Select
                  showSearch
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onChange={onChange}
                  onSearch={onSearch}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={countryLists}
                />
              </Form.Item>
              <Form.Item
                name="birthday"
                label="BirthDay"
              >
                <DatePicker style={{ width: '50%' }} format={"MM/DD/YYYY"} />
              </Form.Item>

              <Form.Item
                name="civil_status"
                label="Civil Status"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Radio.Group name="civil_status" options={civilOptions} />
              </Form.Item>
              <Form.Item
                name="school"
                label="School"
              >
                <Input />

              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
              >
                <Input value={"addddr"} />
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

          <Content style={{ padding: '0 0px' }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                {
                  (currentItem && currentItem.avatar) ?
                    <>

                      <Avatar
                        size={128}
                        src={`${Avatar_url}${currentItem ? currentItem.avatar : ""}`}
                      />
                    </>

                    :
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
                }
              </Col>
              <Col span={12}>
                <p>Name : {currentItem ? currentItem.name : ""}</p>
                <p>Personal ID : {currentItem ? currentItem.personal_id : ""}</p>
                <p>Phone : {currentItem ? currentItem.phone : ""}</p>
              </Col>
              <Col span={6}>
                <Select style={{ width: 120 }} onChange={changeStatus} value={currentItem ? currentItem.status : 4} options={statusOptions} />

              </Col>
            </Row>
            <div className="profile-details">
              <Row>
                <Col span={3}>
                  <h2>Details</h2>
                </Col>
                <Col span={12}>
                  <Button type="primary" onClick={editModal}>Edit</Button>
                </Col>
              </Row>

              <Row gutter={[20, 20]}>

                <Col span={10}>

                  <p>
                    Gender:
                    {
                      currentItem ? genderOptions.find((item) => { return item.value === currentItem.gender }).label : ""
                    }
                  </p>

                  <p>
                    Brith Place:
                    {
                      currentItem ? countryLists.find((item) => { return item.value === currentItem.birthplace }).label : ""
                    }
                  </p>

                  <p>
                    BrithDay:
                    {currentItem ? currentItem.birthday : ""}
                  </p>


                </Col>
                <Col span={10}>
                  <p>
                    Civil Status:
                    {
                      currentItem ? civilOptions.find((item) => { return item.value === currentItem.civil_status }).label : ""
                    }
                  </p>

                  <p>
                    School:
                    {currentItem ? currentItem.school : ""}
                  </p>

                  <p>
                    Address:
                    {currentItem ? currentItem.address : ""}
                  </p>

                </Col>
              </Row>
            </div>

          </Content>
          <BankAccount parentId={currentEmployeeId} />
          <RelatedPeople parentId={currentEmployeeId} />
          <MedicalDetail parentId={currentEmployeeId} />
          <Contract parentId={currentEmployeeId} />
        </div>
        <div tab="Work" key="2">
          <AssignedCustomer parentId={currentEmployeeId} />
          <Schedule parentId={currentEmployeeId} />

          <div className="whiteBox shadow">
            <div className="pad20">
              <h3 style={{ color: '#22075e', marginBottom: 5 }}>Payment history</h3>
            </div>
            <Table columns={paymentColumns} />
          </div>
        </div>
        <div tab="Documents" key="3">
          <EmployeeDocumentManage parentId={currentEmployeeId} />
        </div>
      </Tabs>

    </DashboardLayout>
  );
}
