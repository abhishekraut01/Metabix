import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Navbar from '../navbar/Navbar';
import './recommendation.css';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { getRecommendationAPIMethod, updateQuestionAPIMethod } from "../../api/question";
import Loader from '../loader/Loader';
import { pdfjs } from 'react-pdf';

// Set the worker source for PDF.js to load the worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Recommendation = () => {
    const [recommendation, setRecommendation] = useState(null);
    const [recList, setRecList] = useState([]); // top 10 recommendations
    const { questionId, age, description } = useParams();
    const navigate = useNavigate();

    // Function to truncate long text
    function truncateText(text, limit) {
        return text.length > limit ? text.substring(0, limit) + '...' : text;
    }

    // Function to convert the original URL to the new URL format for PDFs
    function convertToNewUrl(originalUrl) {
        const prefix = 'https://dsld.od.nih.gov/label/';
        const suffix = '.pdf';
        const id = originalUrl.substring(prefix.length);
        return `https://api.ods.od.nih.gov/dsld/s3/pdf/${id}${suffix}`;
    }

    // Fetch recommendations based on age and description
    useEffect(() => {
        getRecommendationAPIMethod(age, description)
            .then(response => response.json())
            .then(data => {
                setRecommendation(data);
                if (data && data.data) {
                    setRecList(data.data.slice(0, 10)); // Get the top 10 recommendations
                }
            })
            .catch(error => console.error('Error fetching recommendations:', error));
    }, [age, description]);

    // Handle updating the question with the recommendation list
    const handleUpdateQuestion = () => {
        const recListPayload = {
            rec_list: recList
        };

        updateQuestionAPIMethod(questionId, recListPayload)
            .then((response) => {
                if (response.ok) {
                    console.log("Recommendation record has been saved.");
                } else {
                    console.log("Error saving recommendation.");
                }
            })
            .catch((err) => {
                console.error("Error when saving recommendation:", err);
            });
    };

    return (
        <div className='recommendation'>
            <Navbar />
            <div className='to_mainpage' onClick={() => { handleUpdateQuestion(); navigate('/mainpage'); }}>
                <KeyboardBackspaceIcon />
                <div>Save & Exit</div>
            </div>
            <div className='recommendation_outer'>
                {recList.length === 0 ? (
                    <>
                        <h1 className='loading_title'>Collecting results...</h1>
                        <p className='loading_subtext'>(This may take up to 30 minutes)</p>
                        <Loader />
                    </>
                ) : (
                    <>
                        <h1>Recommendations ({recList.length})</h1>
                        <div className='recommendation_container'>
                            {recList.map((d, index) => (
                                <div key={index} className='recommendation_inner'>
                                    <div className='recommendation_object'>
                                        <embed src={convertToNewUrl(d[0])} type="application/pdf" width="100%" height="500px" />
                                    </div>
                                    <div className='recommendation_object_bottom'>
                                        <h3>{truncateText(d[2], 50)}</h3>
                                        <div className='recommendation_object_bottom_bottom'>
                                            <p className='maker'>By {d[3]}</p>
                                            <div className='hover_over'>
                                                Hover over me!
                                            </div>
                                            <div className='hidden_div'>
                                                {d[13]}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Recommendation;
