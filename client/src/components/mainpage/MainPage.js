import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/Navbar';
import './mainpage.css';
import boy from "../../assets/images/boy.svg";
import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyQuestionsAPIMethod } from "../../api/question";
import logo2 from "../../assets/images/logo2.png";

const MainPage = () => {
    const navigate = useNavigate();
    const userId = useSelector((state) => state.user.id)
    const [records, setRecords] = useState([]);

    useEffect(() => {
        getMyQuestionsAPIMethod(userId)
            .then(response => response.json())
            .then(data => {
                setRecords(data);
            })
    }, [userId]);

    console.log("records: ", records); // --> questionare records created by the current logged in user

   
    return (
        <div className='mainpage'>
            <Navbar />
            <div className='retake'>
                <Button variant="contained" onClick={() => { navigate(`/form/${userId}`) }} style={{ color: "white", borderColor: "black", fontWeight: "bold", backgroundColor: "black", borderRadius: '3rem', padding: "1rem", fontSize: "12px" }}>Retake the questionnaire!</Button>
            </div>
            <h1>Your History</h1>
            <div className='mainpage_container'>
                {console.log("records: ", records)}
                {records.map((d) => (
                    <div className='mainpage_form_data' onClick={() => navigate(`/mainpagedetails/${d._id}`)}>
                        <img src={logo2} alt='img'/>
                        <div className="mainpage_form_description">
                            Query: {d.description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MainPage;