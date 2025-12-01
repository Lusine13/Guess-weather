import React, { useState, useEffect } from 'react';
import { Input, Button, Form, message, Modal, Collapse } from 'antd';
import { API_URL, API_KEY, cities } from '../constants';
import './index.css';

import correctSound from '../assets/audio/correct.mp3';
import wrongSound from '../assets/audio/wrong.mp3';
import winSound from '../assets/audio/win.mp3';
import loseSound from '../assets/audio/lose.mp3';

const { Panel } = Collapse;

const GuessingWeather = () => {
    const [form] = Form.useForm();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [randomCity, setRandomCity] = useState('');
    const [guessedTemperature, setGuessedTemperature] = useState('');
    const [results, setResults] = useState([]);
    const [usedCities, setUsedCities] = useState(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [round, setRound] = useState(0);

    const maxRounds = 5;
    
    useEffect(() => {
        const city = cities[Math.floor(Math.random() * cities.length)];
        setUsedCities(new Set([city]));
        setRandomCity(city);
    }, []);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.play();
    };

    const pickNextCity = () => {
        let city;
        do {
            city = cities[Math.floor(Math.random() * cities.length)];
        } while (usedCities.has(city));

        setUsedCities(prev => new Set(prev).add(city));
        setRandomCity(city);
    };

    const onFinish = async () => {
        if (round >= maxRounds) return;

        const guessedTemp = parseFloat(guessedTemperature);
        if (isNaN(guessedTemp) || guessedTemperature.trim() === '') {
            message.error('Please enter a valid temperature.');
            return;
        }

        const FETCH_URL = `${API_URL}${randomCity}&appid=${API_KEY}&units=metric`;
        setLoading(true);

        try {
            const response = await fetch(FETCH_URL);
            if (!response.ok) throw new Error();

            const data = await response.json();
            setWeatherData(data);

            const actualTemp = data.main.temp;
            const isCorrect = Math.abs(guessedTemp - actualTemp) <= 4;

            if (isCorrect) {
                message.success('Correct guess!');
                playSound(correctSound);
            } else {
                message.error('Wrong guess!');
                playSound(wrongSound);
            }

            setResults(prev => [
                ...prev,
                {
                    city: data.name,
                    guessed: guessedTemperature,
                    actual: actualTemp,
                    correct: isCorrect
                }
            ]);

            setGuessedTemperature('');
            setRound(prev => prev + 1);
            pickNextCity();
        } catch {
            message.error('Failed to fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (round >= maxRounds) {
            const correctGuesses = results.filter(r => r.correct).length;
            setIsModalVisible(true);

            if (correctGuesses >= 4) {
                playSound(winSound);
            } else {
                playSound(loseSound);
            }
        }
    }, [round, results]);

    const handleTryAgain = () => {
        setRound(0);
        setResults([]);
        setGuessedTemperature('');
        setUsedCities(new Set());
        setWeatherData(null);
        setIsModalVisible(false);

        const city = cities[Math.floor(Math.random() * cities.length)];
        setUsedCities(new Set([city]));
        setRandomCity(city);
    };

    return (
        <div className="container">           
            <h1 className="game-title">🌤️ Guess the Weather</h1>
            
            <Collapse defaultActiveKey={['1']} className="game-rules">
                <Panel header="🎮 How to Play" key="1">
                    <p>🌆 A random city is selected each round</p>
                    <p>🌡️ Guess the temperature in °C</p>
                    <p>⚡ You have <strong>5 rounds</strong></p>
                    <p>✅ ±4°C counts as a correct guess</p>
                    <p>🏆 Guess <strong>4 out of 5</strong> correctly to win 🎉</p>
                </Panel>
            </Collapse>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item>
                    <Input value={randomCity} readOnly className="random_city" />
                </Form.Item>

                <Form.Item>
                    <Input
                        className="guessedNumbers"
                        placeholder="Guess the temperature"
                        value={guessedTemperature}
                        onChange={(e) => setGuessedTemperature(e.target.value)}
                    />
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
                {results.map((r, i) => (
                    <div
                        key={i}
                        className={`result-box ${r.correct ? 'correct' : 'incorrect'}`}
                    >
                        <div>City: {r.city}</div>
                        <div>Guessed: {r.guessed}°C</div>
                        <div>Actual: {r.actual}°C</div>
                    </div>
                ))}
            </div>

            <Modal
                open={isModalVisible}
                footer={[
                    <Button key="tryAgain" onClick={handleTryAgain}>
                        Try Again
                    </Button>
                ]}
                onCancel={() => setIsModalVisible(false)}
            >
                <h3>
                    Game over! You {results.filter(r => r.correct).length >= 4 ? 'win!' : 'lose.'}
                </h3>
            </Modal>
        </div>
    );
};

export default GuessingWeather;
