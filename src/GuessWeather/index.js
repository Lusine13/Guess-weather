import React, { useState, useEffect } from 'react';
import { Input, Button, Form, message } from 'antd';
import { API_URL, API_KEY, cities } from '../constants';


const GuessingWeather = () => {
    const [ form ] = Form.useForm();
    const [ weatherData, setWeatherData ] = useState(null);
    const [ loading, setLoading ] = useState(false);
    const [ randomCity, setRandomCity ] = useState('');
    const [ guessedTemperature, setGuessedTemperature ] = useState('');
    const [ results, setResults ] = useState([]);
    const [ round, setRound ] = useState(0);
    const maxRounds = 5;

    useEffect(() => {
        fetchRandomCity();
    }, []);

    const fetchRandomCity = async () => {
        const city = cities[Math.floor(Math.random() * cities.length)];
        setRandomCity(city);
    };

    const onFinish = async () => {
        if (round >= maxRounds) {
            message.info("Game over!");
            return;
        }
        const FETCH_URL = `${API_URL}${randomCity}&appid=${API_KEY}&units=metric`; 

        setLoading(true);
        try {
            const response = await fetch(FETCH_URL);
            if (!response.ok) {
                throw new Error("Error fetching weather data");
            }
            const data = await response.json();
            setWeatherData(data);
            const actualTemp = data.main.temp;
            const guessedTemp = parseFloat(guessedTemperature);
            const isCorrect = Math.abs(guessedTemp - actualTemp) <= 4;

            if (isCorrect) {
                message.success("Correct guess!");
            } else {
                message.error("Wrong guess. Try again!");
            }

            setResults((prevResults) => [
                ...prevResults,
                { city: data.name, guessed: guessedTemperature, actual: data.main.temp, correct: isCorrect }
            ]);

            setGuessedTemperature('');
            fetchRandomCity();
            setRound(prev => prev +1);
        } catch (error) {
            message.error("An error occurred while fetching the weather data.");
        } finally {
            setLoading(false);
        }
    };
    return (
    <div>    
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
            <div className="results">
                <h3>Your Guesses:</h3>
                {results.map((result, index) => (
                    <div key={index}>
                        <p>
                            City: {result.city}, Guessed: {result.guessed}°C, Actual: {result.actual}°C, 
                            {result.correct ? " Correct!" : " Incorrect."}
                        </p>
                    </div>
                ))}
              </div>
            {round >= maxRounds && <h3>Game Over! You completed {maxRounds} rounds.</h3>}
        </div>   
    )
};


export default GuessingWeather;