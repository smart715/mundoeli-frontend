import { DashboardLayout, } from '@/layout';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Layout, Modal, Popconfirm, Row, Select, Table, Typography, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { request } from '@/request';
import moment from 'moment';
import SelectAsync from '@/components/SelectAsync';
import { useContext } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
const EditableContext = React.createContext(null);
const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};
console.log(role, '343434');
const statusLabel = ["", "Pending", "Progress", "Completed"]
const statusArr = [
  { value: 0, label: "all" },
  { value: 1, label: "Pending" },
  { value: 2, label: "Progress" },
  { value: 3, label: "Completed" },
];
const statusArr1 = [
  { value: 1, label: "Pending" },
  { value: 2, label: "Progress" },
  { value: 3, label: "Completed" },
];
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleSave_,
  ...restProps
}) => {

  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();

      // toggleEdit();
      if (handleSave_) {
        handleSave_({
          ...record,
          ...values,
        }, values);
      } else {
        handleSave({
          ...record,
          ...values,
        }, values);
      }


    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  const handleKeyDown = e => {

    if (e.key === "Tab") {
      e.preventDefault();

      const currentCell = e.target.closest("td");
      const parentElement = currentCell.parentNode;

      var nextCell = null, prevCell = null;
      if (!currentCell.nextElementSibling) {
        nextCell = parentElement.nextElementSibling ? parentElement.nextElementSibling.children[parentElement.nextElementSibling.childElementCount === 2 ? 0 : 2] : currentCell
      } else {
        nextCell = currentCell.nextElementSibling
      }
      if (!currentCell.previousSibling) {
        prevCell = parentElement.previousSibling ? parentElement.previousSibling.children[parentElement.previousSibling.childElementCount === 2 ? 1 : 2] : currentCell
      }
      else if (currentCell.previousSibling && !currentCell.previousSibling.querySelector(".editable-cell-value-wrap")) {
        prevCell = parentElement.previousSibling ? parentElement.previousSibling.children[parentElement.previousSibling.childElementCount - 1] : currentCell
      }
      else {
        prevCell = currentCell.previousSibling
      }

      const Cell = e.shiftKey
        ? prevCell
        : nextCell;
      if (Cell) {
        const input = Cell.querySelector("input");
        if (input) {
          input.focus();
        } else {
          const editableCell = Cell.querySelector(".editable-cell-value-wrap");
          if (editableCell) {
            editableCell.click(); // Call toggleEdit function of nextCell
          }
        }
      }

    }
  };

  let childNode = children;
  if (editable) {
    childNode = (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
      // rules={[
      //   {
      //     required: true,
      //     message: `${title} is required.`,
      //   },
      // ]}
      >
        <Input ref={inputRef} defaultValue={record[dataIndex]} onKeyDown={handleKeyDown} onPressEnter={save} onBlur={save} />
      </Form.Item>
    )
    //  : (
    //   <div
    //     className="editable-cell-value-wrap"
    //     style={{
    //       paddingRight: 24,
    //     }}
    //     onClick={toggleEdit}
    //   >
    //     {children}
    //   </div>
    // );
  }
  return <td {...restProps} onDoubleClick={toggleEdit}>{childNode}</td>;
};
const Projects = () => {
  const entity = "project"
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterData, setFilterData] = useState([]);

  const [isUpdate, setIsUpdate] = useState(false);
  const [rangeDate, setRangeDate] = useState();
  const [billingCost, setBillingCost] = useState();
  const showModal = () => {

    setCurrentId(new Date().valueOf())
    setIsModalVisible(true);
    setIsUpdate(false);
    setEmployeeList([])
    if (formRef.current) formRef.current.resetFields();

  };
  const dispatch = useDispatch();

  const handleOk = () => {
    // handle ok button click here
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [employeeList, setEmployeeList] = useState([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [references, setReferences] = useState([]);
  const [initEmployeeColumns, setInitEmployeeColumns] = useState([]);
  const [paginations, setPaginations] = useState([])
  const [endDate, setEndDate] = useState();
  const [status, setStatus] = useState();
  const [summatoryCost, setSummatoryCost] = useState();
  const [periodsDate, setPeriodsDate] = useState();
  const [currentPeriods, setCurrentPeriods] = useState();
  const [allBilling, setAllBilling] = useState(0);
  const [allECost, setAllECost] = useState(0);
  const [allOCost, setAllOCost] = useState(0);
  const [allProfitability, setAllProfitability] = useState(0);

  const employeeRef = useRef(null);
  const costRef = useRef(null);
  const isEditing = (record) => record.key === editingKey;

  const deleteEmployee = (record) => {
    const filteredData = employeeList.filter(item => item.key !== record.key);
    setEmployeeList(filteredData)
  }
  const editItem = (item) => {

    if (item) {
      if (formRef.current) formRef.current.resetFields();
      setTimeout(() => {

        const { employees, costs, _id, removed, enabled, created, periods, ...otherValues } = item;
        if (formRef.current) formRef.current.setFieldsValue({ ...otherValues, periods: periods ? [moment(periods[0]), moment(periods[1])] : null });
        setEmployeeList(JSON.parse(employees || "[]"))
        setCostList(JSON.parse(costs || "[]"))

      }, 200);
      console.log(item, '33334343');
      setCurrentItem(item);
      setPeriodsDate(item.periods);
      setBillingCost(item.billing)
      setCurrentId(item._id);
      setIsModalVisible(true);
      setIsUpdate(true);
    }
  }
  const deleteItem = (item) => {
    const id = item._id;
    dispatch(crud.delete({ entity, id }))
    setTimeout(() => {
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, 1000)
  }
  const getDateLabel = (date) => {
    if (!date) return '';
    const start = moment(date[0]);
    const end = moment(date[1]);
    return `${start.format("MMMM")}${start.date()}(${start.year()}) - ${end.format("MMMM")}${end.date()}(${end.year()})`
  }
  const columns = [
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      render: (text, record) => {
        return <label onClick={() => editItem(record)}>{text}</label>
      }
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
    },
    {
      title: "Billing ID",
      dataIndex: "invoice_id"
    },
    {
      title: 'Date',
      dataIndex: 'periods',
      render: (text) => {
        return (getDateLabel(text))
      }
    },
    {
      title: 'Employees',
      dataIndex: 'employees',
      render: (text) => {
        return (
          text ? JSON.parse(text).length : 0
        );
      }
    },
    {
      title: 'Billing',
      dataIndex: 'billing',
      render: (text) => {
        return (
          `$${text}`
        );
      }
    },

    {
      title: 'E.Costs',
      dataIndex: 'e_cost',
      render: (text) => {
        return (
          `$${text || 0}`
        );
      }
    },
    {
      title: 'O.Costs',
      dataIndex: 'o_cost',
      render: (text) => {
        return (
          `$${text || 0}`
        );
      }
    },
    {
      title: 'Profitability',
      dataIndex: 'profitability',
      render: (text) => {
        return (
          `$${text || 0}`
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text) => {
        return (statusLabel[text]);
      }
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      align: 'center',
      render: (_, record) => {
        return (
          role === 0 ?
            <>
              <Typography.Link onClick={() => editItem(record)}>
                <EditOutlined style={{ fontSize: "20px" }} />
              </Typography.Link>

              <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                <DeleteOutlined style={{ fontSize: "20px" }} />
              </Popconfirm>
            </> : ''
        )

      },
    },

  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record).toString(),
      }),
    };
  });
  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);
  const { pagination, items } = listResult;
  const onFinish = async (values) => {

    values['employees'] = JSON.stringify(employeeList);
    values['costs'] = JSON.stringify(costList);
    // const obj1 = JSON.parse(currentItem.employees);
    // const obj2 = employeeList;
    // const result = getObjectDiff(obj1, obj2);
    // console.log(result, '2222222222');
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      // const { result } = await request.create({ entity, jsonData: values });
      dispatch(crud.create({ entity, jsonData: values }));
    }
    formRef.current.resetFields();
    setTimeout(() => {
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, [400])
    handleCancel()
  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };


  useEffect(() => {
    if (periodsDate) {
      const start = moment(periodsDate[0]);
      const end = periodsDate[1];
      const Columns = [
        {
          title: 'Actions',
          dataIndex: 'operation',
          width: "10%",
          align: 'center',
          render: (_, record) => {
            return (
              <>
                <Popconfirm title="Sure to delete?" onConfirm={() => deleteEmployee(record)}>
                  <DeleteOutlined style={{ fontSize: "20px" }} />
                </Popconfirm>
              </>
            )

          },
        },

        {
          title: "Employee",
          dataIndex: "employee",
          render: (_, record) => {
            return (
              <SelectAsync _width={true} entity={"employee"} displayLabels={["name"]} onChange={(e) => changeEmployee(e, record)} value={_} />
            );
          }
        },
        {
          title: "Total",
          dataIndex: "total",
          render: (_, record) => {
            return (totalHours(record) || 0);
          }
        },
      ]
      if (start && end) {

        setCurrentPeriods(periodsDate);
        // setEmployeeList([])
        const _columns = [];
        while (start.isSameOrBefore(end)) {
          _columns.push({
            title: start.format("MMMM/DD"),
            dataIndex: `day_${start.format("YYYY-MM-DD")}`,
            editable: true
          })
          start.add(1, 'day')
        }

        setInitEmployeeColumns([...Columns, ..._columns])
      }
    } else {
      return true
    }
  }, [
    periodsDate
  ])
  const addEmployee = () => {
    if (formRef.current && !formRef.current.getFieldValue("periods")) {
      return message.info("you have to select periods")
    }
    const defaultObj = {};
    for (var i = 0; i < initEmployeeColumns.length; i++) {
      var { dataIndex } = initEmployeeColumns[i];
      if (dataIndex.includes('day_')) {
        defaultObj[dataIndex] = 0;
      }
    }
    setEmployeeList([...employeeList, { key: new Date().valueOf(), ...defaultObj }])
  }


  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));

    async function init() {
      const { result } = await request.list({ entity: 'reference' });
      result.map(obj => {
        obj.value = obj._id;
        obj.label = obj.ref
      })
      setReferences(result);
    }
    init();
  }, []);
  useEffect(() => {

    items.map(item => {
      const { costs, cost } = item;
      const o_cost = JSON.parse(costs || "[]").reduce((total, _item) => total + parseFloat(_item.cost), 0)
      item["o_cost"] = o_cost || 0
      item["e_cost"] = cost - (o_cost || 0)
    })
    setFilterData(items);
    setPaginations(pagination)
  }, [items, pagination])
  const handleSave = (row, values) => {
    row["total"] = totalHours(row);
    const newData = [...employeeList];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];


    console.log(item, 'item------')
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setEmployeeList(newData);
  };
  const handleSave_ = (row, values) => {
    row["total"] = totalHours(row);
    const newData = [...costList];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setCostList(newData);
  };
  useEffect(() => {

    console.log(initEmployeeColumns, employeeList, 'initEmployeeColumns');
    const newData = [...employeeList];
    newData.map(obj => [
      initEmployeeColumns.map(columns => {
        const { dataIndex } = columns;
        if (dataIndex.includes('day_') && !obj.hasOwnProperty(dataIndex)) {
          obj[dataIndex] = 0;
        }
      })
    ])
    setEmployeeList(newData)
  }, [initEmployeeColumns])

  const totalHours = (record) => {

    const _periods = formRef.current.getFieldValue("periods")

    if (_periods) {
      const start = moment(_periods[0]);
      const end = moment(_periods[1]);
      var total = 0;
      while (start.isSameOrBefore(end)) {
        total += parseFloat(record[`day_${start.format("YYYY-MM-DD")}`] || 0);
        start.add(1, 'day')
      }
      // for (var key in record) {
      //   if (key.includes('day_')) {
      //     total += parseFloat(record[key]);
      //   }
      // }
      return total;
    }
  }

  const changeEmployee = (value, record) => {

    record.employee = value;
    const updatedData = employeeList.map((item) => {
      if (item.key === record.key) {
        return record;
      }
      return item;
    });
  }
  useEffect(() => {
    const filteredData = items.filter((record) => {
      const { customer } = record;

      const recordStartDate = record.periods ? new Date(moment(record.periods[0]).format("YYYY-MM-DD")) : null;
      const recordEndDate = record.periods ? new Date(moment(record.periods[1]).format("YYYY-MM-DD")) : null;
      const startDate = rangeDate ? new Date(rangeDate[0].format("YYYY-MM-DD")) : null;
      const endDate = rangeDate ? new Date(rangeDate[1].format("YYYY-MM-DD")) : null;
      return (
        (!searchText || record['project_id'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
          customer['name'].toString().toLowerCase().includes(searchText.toLowerCase())) &&
        (!rangeDate || (startDate && endDate && recordStartDate >= startDate && recordEndDate <= endDate)) &&
        (!status || record.status === status)
      );

    })
    setFilterData(filteredData);
    setPaginations({ current: 1, pageSize: 10, total: filteredData.length })
  }, [searchText, status, rangeDate])

  const handelDataTableLoad = useCallback((pagination) => {
    const { current, total } = pagination;
    setPaginations(pagination)
    return true;
  }, [filterData, searchText]);


  useEffect(() => {
    console.log(filterData, 'filterData');
    let _billing = 0;
    let _ecost = 0;
    let _ocost = 0;
    let _Profitability = 0;

    filterData.map(item => {
      const { billing, e_cost, o_cost, profitability } = item
      _billing += parseFloat(billing) || 0;
      _ecost += parseFloat(e_cost) || 0;
      _ocost += parseFloat(o_cost) || 0;
      _Profitability += parseFloat(profitability) || 0;
    });
    setAllBilling(_billing);
    setAllECost(_ecost);
    setAllOCost(_ocost);
    setAllProfitability(_Profitability);

  }, [filterData])
  const Footer = () => {
    const pages = paginations
    const { current, count, total, page } = pages
    const currentPage = current || page;
    const totalSize = total || count;

    return (
      <>
        Mostrando registros del {filterData.length ? ((currentPage - 1) * 10 + 1) : 0} al {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} de un total de {totalSize} registros
      </>
    );
  }
  const addCost = () => {
    setCostList([...costList, { cost: 0, comment: "..", key: new Date().valueOf() }])
  }
  const costColumn = [
    {
      title: "Cost",
      dataIndex: "cost",
      editable: true,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      editable: true,
    }
  ]
  const [costList, setCostList] = useState([]);
  const [allEmployeeCost, setAllEmployeeCost] = useState(0);
  const [all_Cost, setAll_Cost] = useState(0);
  useEffect(() => {
    var totalCost = 0, employee_cost = 0, _cost = 0;
    employeeList.map(item => {
      totalCost += parseFloat(item.total) || 0;
      employee_cost += parseFloat(item.total) || 0;


      // for (var key in item) {
      //   if (key.includes("day_")) {
      //     console.log(key, item[key]);
      //     item[key] = <Input value={item[key]} />

      //   }
      // }

    })
    setAllEmployeeCost(employee_cost);
    costList.map(obj => {
      totalCost += parseFloat(obj.cost) || 0;
      _cost += parseFloat(obj.cost) || 0;
    })
    setAll_Cost(_cost)
    setSummatoryCost(totalCost)
    if (formRef.current) formRef.current.setFieldsValue({ cost: totalCost })
    if (employeeRef.current) {
      console.log(employeeRef.current)
    }
  }, [
    employeeList, costList
  ])

  useEffect(() => {
    console.log(billingCost, 'summatoryCost, billingCost');
    if (formRef.current) formRef.current.setFieldsValue({ profitability: (billingCost - summatoryCost) })
  }, [
    summatoryCost, billingCost
  ]);
  const _columns = initEmployeeColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        editing: isEditing(record).toString(),

      }),
    };
  })
  return (

    <DashboardLayout>
      <Layout style={{ minHeight: '100vh' }}>
        <Modal title="Create Form" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null} width={1500}>
          <>
            <Form
              ref={formRef}
              name="basic"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >

              <Row gutter={24}>

                <Col span={12}>
                  <Form.Item
                    name="customer"
                    label="Customer"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <SelectAsync entity={'client'} displayLabels={['name']} />
                  </Form.Item>
                  <Form.Item name="periods" label="From ~ To" rules={[
                    {
                      required: true,
                    },
                  ]}>
                    <DatePicker.RangePicker onCalendarChange={(e) => setPeriodsDate(e)} />
                  </Form.Item>
                  <Form.Item
                    name="billing"
                    label="Billing"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input type='number' onChange={(e) => setBillingCost(e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select options={statusArr1} />
                  </Form.Item>


                </Col>
                <Col span={12}>
                  <Form.Item
                    name="invoice_id"
                    label="Invoice ID"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="ref"
                    label="Reference"
                    rules={[

                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                    {/* <SelectAsync entity={'reference'} displayLabels={['ref']} /> */}

                    {/* <Select

                      placeholder="Select Reference"
                      optionFilterProp="children"
                      options={references} /> */}
                  </Form.Item>
                  <Form.Item
                    name="cost"
                    label="Cost"
                  // rules={[
                  //   {
                  //     required: true,
                  //   },
                  // ]}
                  >
                    <Input type='number' readOnly style={{ background: 'lightgrey' }} value={summatoryCost} />
                  </Form.Item>
                  <Form.Item
                    name="profitability"
                    label="Profitability"
                  >
                    <Input type='number' readOnly style={{ background: 'lightgrey' }} value={summatoryCost} />
                  </Form.Item>
                  <Form.Item

                    name='project_details'
                    label="Project details"

                  >
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >


                {
                  isUpdate ? <Button type="primary" htmlType="submit">
                    Update
                  </Button> :
                    <Button type="primary" htmlType="submit">
                      Save
                    </Button>

                }

                <Button type="ghost" onClick={handleCancel}>
                  cancel
                </Button>
              </Form.Item>

              <hr />
            </Form>
            <Row gutter={24}>

              <Col span={16}>

                <Button onClick={addEmployee}>Add Employee</Button>
                <label style={{ float: 'right' }}> Total Cost:{allEmployeeCost}</label>
                <Table
                  dataSource={employeeList || []}
                  columns={_columns}
                  style={{ overflow: "scroll" }}
                  components={components}
                  ref={employeeRef}
                />
              </Col>
              <Col span={8}>
                <Button onClick={addCost}>Add Cost</Button>
                <label style={{ float: 'right' }}> Total Cost:{all_Cost}</label>
                <Table
                  dataSource={costList || []}
                  columns={costColumn.map((col) => {
                    if (!col.editable) {
                      return col;
                    }
                    return {
                      ...col,
                      onCell: (record) => ({
                        record,
                        editable: col.editable,
                        dataIndex: col.dataIndex,
                        title: col.title,
                        handleSave_,
                        editing: isEditing(record).toString(),
                      }),
                    };
                  })}
                  ref={costRef}
                  style={{ overflow: "scroll" }}
                  components={components}

                />
              </Col>


            </Row>
          </>
        </Modal>
        <Layout>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            <Col span={8}></Col>
            <Col span={4}>
              <h3 >Billing:{allBilling}</h3>
            </Col>
            <Col span={4}>

              <h3>E.Costs:{allECost}</h3>
            </Col>
            <Col span={4}>

              <h3>O.Costs:{allOCost}</h3>
            </Col>
            <Col span={4}>

              <h3>Profitability:{allProfitability}</h3>
            </Col>
          </Row>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            <Col span={6}>
              <Input
                placeholder='Search'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <DatePicker.RangePicker value={rangeDate} onChange={(e) => { setRangeDate(e) }} />
            </Col>
            <Col span={12}>
              <Select
                placeholder="Status Filter"
                optionFilterProp="children"
                onChange={(e) => { setStatus(e) }}
                options={statusArr} />
              <Button onClick={showModal} type="primary">Create Project</Button>
            </Col>
          </Row>

          <Form form={form} component={false}>
            <Table

              bordered
              rowKey={(item) => item._id}
              key={(item) => item._id}
              dataSource={filterData}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={paginations}
              onChange={handelDataTableLoad}
              footer={Footer}
              scroll={{
                x: 1300,
              }}

            />
          </Form>


        </Layout>
      </Layout>
    </DashboardLayout >
  );
};
export default Projects;