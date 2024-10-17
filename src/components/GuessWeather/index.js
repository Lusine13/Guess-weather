import React, { useState } from 'react';
import { Input, Button, Form, message } from 'antd';
import { API_URL, API_KEY, RandomCity } from '../../constants';


const GuessingWeather = () => {
    const [ form ] = Form.useForm();
    const [ weatherData, setWeatherData ] = useState(null);
    const [ loading, setLoading ] = useState(false);

    const onFinish = async () => {
        const FETCH_URL = `${API_URL}${RandomCity}&appid=${API_KEY}&units=metric`; 

        setLoading(true);
        try {
            let response = await fetch(FETCH_URL);
            if (!response.ok) {
                throw new Error("Error fetching weather data");
            }
            let data = await response.json();
            setWeatherData(data);
        } catch (error) {
            message.error("An error occurred while fetching the weather data.");
        } finally {
            setLoading(false);
        }
    };
    return (
     <Form layout="vertical" form={form} onFinish={onFinish}>       
      <div className='random_city'>
      <p>{RandomCity}</p>
      </div>
      <Input type="text" className="guessedNumbers" placeholder="Guess the weather"/>
      
      <Button type="primary" htmlType="submit" loading={loading} className="checkingBtn">
        Check
      </Button>
      {weatherData && (
                <div className="weather-result">
                    <h2>{weatherData.name}</h2>
                    <h2>{weatherData.main.temp}°C</h2>
                </div>
            )}
    </Form>
    )
};


export default GuessingWeather;