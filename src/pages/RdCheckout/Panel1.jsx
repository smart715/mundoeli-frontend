import SelectAsync from "@/components/SelectAsync";
import { Button, message } from "antd";
import { useCallback, useState } from "react";

const Panel1 = ({ setAssignedUser }) => {
    const [selectedUser, SetSelectedUser] = useState(false);
    const Assign = useCallback(() => {
        if (!selectedUser) {
            message.warning('Select user use to assign!')
        } else {
            setAssignedUser(selectedUser);
        }
    }, [selectedUser])
    return (
        <div className="col-4 bg-red h-100 bg-active-danger border-gray-500 border ">
            <div className="h-100px border border-gray-300 bg-success"></div>
            <div className="h-75">
                <div className="m-auto text-center py-10">
                    <h4 className="text text-success t">Select the use to link checkout view</h4>
                </div>
                <div className="d-flex justify-content-center">
                    <SelectAsync onChange={(e) => { SetSelectedUser(e) }} placeholder="Select user" className="w-75 just" entity={'admin'} displayLabels={["name"]} />
                </div>
                <div className="d-flex justify-content-center py-4">
                    <Button className="w-50" onClick={Assign}>Assign</Button>
                </div>

            </div>
        </div>
    );
}
export default Panel1;