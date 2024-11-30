import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './recommendation.css';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import MOCK_DATA from '../../api/MOCK_DATA.json';
import Loader from '../loader/Loader';

const Recommendation = () => {
    const [recList, setRecList] = useState([]); // Top 10 recommendations
    const [loading, setLoading] = useState(true); // Loading state
    const { questionId } = useParams();
    const navigate = useNavigate();

    // Function to truncate long text
    function truncateText(text, limit) {
        return text.length > limit ? text.substring(0, limit) + '...' : text;
    }

    // Function to convert the original URL to the new URL format for PDFs
    // function convertToNewUrl(originalUrl) {
    //     const prefix = 'https://dsld.od.nih.gov/label/';
    //     const suffix = '.pdf';
    //     const id = originalUrl.substring(prefix.length);
    //     return `https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/${id}.jpg`;
    // }

    // Function to fetch a dynamic range of data
    const fetchDynamicRange = (start, end) => {
        return MOCK_DATA.slice(start, end);
    };

    // Generate random `start` and `end` indices
    const getRandomRange = (max) => {
        const start = Math.floor(Math.random() * max);
        const end = Math.floor(Math.random() * (max - start)) + start + 1; // Ensure `end` is greater than `start`
        return { start, end };
    };

    // Simulate fetching data with a delay
    useEffect(() => {
        const { start, end } = getRandomRange(MOCK_DATA.length);

        console.log(`Fetching data from index ${start} to ${end}`); // Log the range

        const delay = setTimeout(() => {
            const data = fetchDynamicRange(start, end);
            setRecList(data); // Set the dynamically fetched range
            setLoading(false); // Stop loading
        }, 10000); // 10-second delay

        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(delay);
    }, []);

    // Handle updating the question with the recommendation list
    const handleUpdateQuestion = () => {
        const recListPayload = {
            rec_list: recList
        };

        console.log("Recommendation record has been saved:", recListPayload);
        // Simulate API response
        alert("Recommendations have been saved!");
    };

    return (
        <div className='recommendation'>
            <Navbar />
            <div className='to_mainpage' onClick={() => { handleUpdateQuestion(); navigate('/mainpage'); }}>
                <KeyboardBackspaceIcon />
                <div>Save & Exit</div>
            </div>
            <div className='recommendation_outer'>
                {loading ? (
                    <>
                    <Loader/>
                        <h1 className='loading_title'>Collecting results...</h1>
                        <p className='loading_subtext'>(This may take up to 10 seconds)</p>
                    </>
                ) : (
                    <>
                        <h1>Recommendations ({recList.length})</h1>
                        <div className='recommendation_container'>
                            {recList.map((d, index) => (
                                <div key={index} className='recommendation_inner'>
                                    <div className='recommendation_object'>
                                        {/* <embed  type="application/pdf" width="100%" height="500px" /> */}
                             {<img src={`https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/${parseInt(d[1])}.jpg`} width="100%" height="100%" alt='img' ></img>}

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
