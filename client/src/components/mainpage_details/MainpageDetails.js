import React, { useEffect, useState } from 'react';
import Navbar from '../navbar/Navbar';
import './mainpagedetails.css';
import { useParams } from 'react-router-dom';
import { getQuestionById } from '../../api/question';
import { pdfjs } from 'react-pdf';

// Setting the worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MainpageDetails = () => {
    const { postId } = useParams();
    const [question, setQuestion] = useState(null);

    // Function to convert the original URL to a new format for PDF embedding
    function convertToNewUrl(originalUrl) {
        const prefix = 'https://dsld.od.nih.gov/label/';
        const suffix = '.pdf';
        const id = originalUrl.substring(prefix.length);
        return `https://api.ods.od.nih.gov/dsld/s3/pdf/${id}${suffix}`;
    }

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const res = await getQuestionById(postId);
                const data = await res.json();
                setQuestion(data);
            } catch (error) {
                console.error('Error fetching question:', error);
            }
        };
        fetchQuestion();
    }, [postId]);

    return (
        <div className='mainpage_details'>
            <Navbar />
            {question && (
                <>
                    <div className='mainpage_details_top'>
                        <h1>Recommendations ({question.rec_list.length})</h1>
                    </div>
                    <div className='mainpage_details_container'>
                        {question.rec_list.map((d, index) => (
                            <div key={index} className='mainpage_details_inner'>
                                <div className='mainpage_details_object'>
                                    <embed src={convertToNewUrl(d[0])} type="application/pdf" width="100%" height="100%" />
                                </div>
                                <div className='mainpage_details_object_bottom'>
                                    <h3>{d[2]}</h3>
                                    <p>By {d[3]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MainpageDetails;
