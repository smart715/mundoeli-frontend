import { crud } from "@/redux/crud/actions";
import { selectListItems, selectListsByAssignedEmployee, selectListsByContract, } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined, } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, InputNumber, Modal, Popconfirm, Row, Select, Table, TimePicker, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SelectAsync from "@/components/SelectAsync";
import moment from "moment";
import { request } from "@/request";


const Schedule = (props) => {
    const entity = 'assignedEmployee';
    const currentEmployeeId = props.parentId

    const scheduleColumns = [
        {
            title: 'Company',
            dataIndex: ['parent_id', 'name'],

        },
        {
            title: 'Monday',
            dataIndex: 'monday',
            render: (monday) => {
                return monday ? `${moment(monday[0]).format("HH:mm")} - ${moment(monday[1]).format("HH:mm")}` : ''
            }
        },
        {
            title: 'Tuesday',
            dataIndex: 'tuesday',
            render: (tuesday) => {
                return tuesday ? `${moment(tuesday[0]).format("HH:mm")} - ${moment(tuesday[1]).format("HH:mm")}` : ''
            }
        },
        {
            title: 'Wednesday',
            dataIndex: 'wednesday',
            render: (wednesday) => {
                return wednesday ? `${moment(wednesday[0]).format("HH:mm")} - ${moment(wednesday[1]).format("HH:mm")}` : ''
            }
        },
        {
            title: 'Tursday',
            dataIndex: 'thursday',
            render: (thursday) => {
                return thursday ? `${moment(thursday[0]).format("HH:mm")} - ${moment(thursday[1]).format("HH:mm")}` : ''
            }
        },
        {
            title: 'Friday',
            dataIndex: 'friday',
            render: (friday) => {
                return friday ? `${moment(friday[0]).format("HH:mm")} - ${moment(friday[1]).format("HH:mm")}` : ''
            }
        },
        {
            title: 'Saturday',
            dataIndex: 'saturday',
            render: (saturday) => {
                return saturday ? `${moment(saturday[0]).format("HH:mm")} - ${moment(saturday[1]).format("HH:mm")}` : ''
            }
        },
        {
            title: 'Sunday',
            dataIndex: 'sunday',
            render: (sunday) => {
                return sunday ? `${moment(sunday[0]).format("HH:mm")} - ${moment(sunday[1]).format("HH:mm")}` : ''
            }
        },
    ];


    const getFormattedHours = (days) => {
        const dayLabels = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
        const hours = [];

        for (let i = 0; i < days.length; i++) {
            if (!days[i]) continue
            const [start, end] = days[i];

            if (start === end) {
                hours.push(dayLabels[i] + ' ' + new Date(start).getHours());
            } else if (i === 0 || start !== days[i - 1][0] || end !== days[i - 1][1]) {
                hours.push(dayLabels[i] + '( ' + new Date(start).getHours() + '-' + new Date(end).getHours() + ')');
            }
        }
        return hours.join(', ');
    }



    const [scheduleData, setScheduleData] = useState([]);

    useEffect(() => {
        const init = async () => {
            const { result } = await request.listById({ entity, jsonData: { employee: currentEmployeeId } })
            console.log(result, 'resultresultresult');
            if (result) {

                result.map((data, index) => {
                    data['key'] = index
                })

                console.log(result, 'result');
                setScheduleData(result)
            }
        }
        init();
    }, [])
    return (

        <div className="whiteBox shadow">
            <Row>
                <Col span={12}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Schedule</h3>
                </Col>
            </Row>
            <Table
                bordered
                dataSource={scheduleData || []}
                columns={scheduleColumns}
                rowClassName="editable-row"
            />
        </div>
    );
}

export default Schedule;