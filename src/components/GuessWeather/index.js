import React, { useState, useEffect } from 'react';
import { Input, Button, Form, message } from 'antd';
import { API_URL, API_KEY, cities } from '../../constants';


const GuessingWeather = () => {
    const [ form ] = Form.useForm();
    const [ weatherData, setWeatherData ] = useState(null);
    const [ loading, setLoading ] = useState(false);
    const [ randomCity, setRandomCity ] = useState('');
    const [guessedTemperature, setGuessedTemperature] = useState('');

    useEffect(() => {
        const fetchRandomCity= async () => {
            const city = cities[Math.floor(Math.random() * cities.length)];
            setRandomCity(city);
        };

        fetchRandomCity();
    }, []);
    const onFinish = async () => {
        const FETCH_URL = `${API_URL}${randomCity}&appid=${API_KEY}&units=metric`; 

        setLoading(true);
        try {
            const response = await fetch(FETCH_URL);
            if (!response.ok) {
                throw new Error("Error fetching weather data");
            }
            const data = await response.json();
            setWeatherData(data);

            if (parseFloat(guessedTemperature) === data.main.temp) {
                message.success("Correct guess!");
            } else {
                message.error("Wrong guess. Try again!");
            }
        } catch (error) {
            message.error("An error occurred while fetching the weather data.");
        } finally {
            setLoading(false);
        }
    };
    return (
     <Form layout="vertical" form={form} onFinish={onFinish}>  
      <Form.Item>  
      <Input type='text' value={randomCity} readOnly className='random_city' />
      </Form.Item>
      <Form.Item>
      <Input type="text" className="guessedNumbers" placeholder="Guess the weather" value={guessedTemperature} 
                    onChange={(e) => setGuessedTemperature(e.target.value)}/>
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} className="checkingBtn">
        Check
      </Button>
      {weatherData && (
                <div className="weather_result">
                    <h2>{weatherData.name}</h2>
                    <h2>{weatherData.main.temp}°C</h2>
                </div>
            )}
    </Form>
    )
};


export default GuessingWeather;