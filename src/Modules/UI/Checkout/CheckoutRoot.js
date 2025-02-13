import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useRoom} from "../../hooks";
import {collection, doc, getFirestore, setDoc} from "firebase/firestore";
import {Order, OrderConverter} from "../../../Classes/Order";
import {FBInit} from "../../FirebaseWrapper/FBInit";
import {useFBAuth} from "../../FirebaseWrapper/FBAuth";
import {Button, Divider, Paper, Typography} from "@mui/material";
import {useState} from "react";
import dayjs from 'dayjs';
import './css/Checkout.css'
import {DatePickers} from "./Components/DatePickers";
import {BriefRoomInfo} from "./Components/BriefRoomInfo";
import {diffInString, getDiff} from "./Components/Diff";
import {CustomerInfo} from "./Components/CustomerInfo";
import {GuestCount} from "./Components/GuestCount";
import {Payment} from "./Components/Payment";
import CircularProgress from "@mui/material/CircularProgress";
import {Loading} from "../Common/Loading";

export const CheckoutRoot = () => {
    const params = useParams()
    const location = useLocation()
    const [auth, isSignIn] = useFBAuth()
    const [room, loading] = useRoom(params.checkout)
    const searchParams = new URLSearchParams(location.search)
    const [startDate, setStartDate] = useState(dayjs(searchParams.get("startDate")))
    const [endDate, setEndDate] = useState(dayjs(searchParams.get("endDate")))
    const [adultCount, setAdultCount] = useState(0)
    const [juvenileCount, setJuvenileCount] = useState(0)
    const [payment, setPayment] = useState("")
    const navigate = useNavigate()

    const onButtonClick = () => {
        if (isSignIn) {
            alert(`${room.id}`)
            const order = new Order();
            const rand = Math.floor(Math.random() * (1000000 - 1000) + 1000)
            order.UID = auth.currentUser.uid
            order.roomId = room.id
            order.orderId = generateOrderId() + `-${rand.toString().padStart(7, '0')}`
            createOrder(order)
            navigate('/MyPage')
        }
    }

    if (loading){
        return (<Loading/>)
    }
    return (
        <div className="container">
            <article>
                <Paper className='order-paper' elevation={3}>
                    <div className='order-section' style={{paddingTop: 40}}>
                        <Typography sx={{fontSize: 20, marginLeft: 5}} color="text.secondary" gutterBottom> 숙소
                            정보 </Typography>
                        <Divider sx={{marginBottom: 2}}/>
                        <BriefRoomInfo room={room} id={params.checkout}/>
                    </div>
                    <div className='order-section'>
                        <Typography sx={{fontSize: 20, marginLeft: 5}} color="text.secondary" gutterBottom> 숙박
                            일정</Typography>
                        <Divider sx={{marginBottom: 2}}/>
                        <DatePickers start={{startDate, setStartDate}} end={{endDate, setEndDate}}/>
                    </div>

                    <div className='order-section'>
                        <Typography sx={{fontSize: 20, marginLeft: 5}} color="text.secondary" gutterBottom>
                            투숙 인원 </Typography>
                        <Divider sx={{marginBottom: 2}}/>
                        <GuestCount adult={{adultCount, setAdultCount}} juvenile={{juvenileCount, setJuvenileCount}}/>
                    </div>

                    <div className='order-section'>
                        <Typography sx={{fontSize: 20, marginLeft: 5}} color="text.secondary" gutterBottom>
                            예약자 정보 </Typography>
                        <Divider sx={{marginBottom: 2}}/>
                        <CustomerInfo/>
                    </div>
                    <div className='order-section'>
                        <Typography sx={{fontSize: 20, marginLeft: 5}} color="text.secondary" gutterBottom>
                            결제 정보 </Typography>
                        <Divider sx={{marginBottom: 2}}/>
                        <Payment current={payment} set={setPayment}/>
                    </div>
                </Paper>
                <br/>
                <br/>
            </article>
            <aside>
                {/*컨테이너가 따라다녀야함*/}
                <Paper sx={{width: '90%', margin: 10}} elevation={12}>
                    <p> 이용 기간 : {diffInString(getDiff(endDate, startDate))} </p>
                    <p> 투숙 인원 : 성인 {adultCount}명, 미성년자 {juvenileCount}명</p>
                    <p> 결제 수단 : {payment} </p>
                    <Button className='button' sx={{width: "70%"}} color="success" variant={"contained"}
                            onClick={onButtonClick}>결제하기 </Button>
                </Paper>
            </aside>
        </div>
    )

}

const createOrder = (order) => {
    const firestore = getFirestore(FBInit().app)
    const orderRef = collection(firestore, "orders")
    const docRef = doc(orderRef)
    setDoc(docRef.withConverter(OrderConverter), order).then()
}

const generateOrderId = () => {
    const date = new Date(Date.now())
    return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`
}


