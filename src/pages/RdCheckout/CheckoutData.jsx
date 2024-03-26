import { useEffect } from "react";

const CheckoutData = ({ data = false, setCheckoutArr = false }) => {
    useEffect(() => {
        if (data || setCheckoutArr) {
            setCheckoutArr(data);
        }
    }, [data])
    return (<></>);
}
export default CheckoutData