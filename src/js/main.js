import { fetchWeather } from './api.js';

let currentWeatherData = null;

const convertTemp = (celsius, toFahrenheit) => {
    if (toFahrenheit) {
        return Math.round((celsius * 9/5) + 32);
    }
    return celsius;
};

// Weather icon mapping
const getWeatherIcon = (conditions) => {
    const iconMap = {
        'Clear': 'wi-day-sunny',
        'Partially cloudy': 'wi-day-cloudy',
        'Cloudy': 'wi-cloudy',
        'Rain': 'wi-rain',
        'Snow': 'wi-snow',
        'Thunder': 'wi-thunderstorm',
        'Fog': 'wi-fog',
    };
    return iconMap[conditions] || 'wi-day-sunny';
};

const formatCurrentDate = () => {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
};

// Generate HTML for main weather information
const generateMainInfoHTML = (weatherData, isFahrenheit = false) => `
    <div class="main-info">
        <div class="location-container">
            <h2>${weatherData.location}</h2>
            <div class="current-date">${formatCurrentDate()}</div>
            <div class="current-weather">
                <i class="wi ${getWeatherIcon(weatherData.conditions)} weather-icon"></i>
                <div class="temperature">${convertTemp(weatherData.temperature, isFahrenheit)}°${isFahrenheit ? 'F' : 'C'}</div>
            </div>
            <div class="conditions">${weatherData.conditions}</div>
            <div class="feels-like">Feels like: ${convertTemp(weatherData.feelsLike, isFahrenheit)}°${isFahrenheit ? 'F' : 'C'}</div>
        </div>
    </div>
`;

// Generate HTML for forecast summary
const generateForecastHTML = (weatherData) => `
    <div class="forecast-summary">
        <h3>Today's Forecast</h3>
        <p>${weatherData.description}</p>
        <div class="temp-range">
            <span>High: ${weatherData.todaySummary.tempmax}°C</span>
            <span>Low: ${weatherData.todaySummary.tempmin}°C</span>
        </div>
        <p>Precipitation Chance: ${weatherData.todaySummary.precipprob}%</p>
    </div>
`;

// Generate HTML for weather details
const generateDetailsHTML = (weatherData) => `
    <div class="details">
        <div class="detail-item">
            <i class="wi wi-humidity detail-icon"></i>
            <div class="detail-info">
                <div class="detail-label">Humidity</div>
                <div class="detail-value">${weatherData.humidity}%</div>
            </div>
        </div>
        
        <div class="detail-item">
            <i class="wi wi-strong-wind detail-icon"></i>
            <div class="detail-info">
                <div class="detail-label">Wind Speed</div>
                <div class="detail-value">${weatherData.windSpeed} km/h</div>
            </div>
        </div>

        <div class="detail-item">
            <i class="wi wi-day-sunny detail-icon"></i>
            <div class="detail-info">
                <div class="detail-label">UV Index</div>
                <div class="detail-value">${weatherData.uvIndex}</div>
            </div>
        </div>
        
        <div class="detail-item">
            <i class="wi wi-dust detail-icon"></i>
            <div class="detail-info">
                <div class="detail-label">Visibility</div>
                <div class="detail-value">${weatherData.visibility} km</div>
            </div>
        </div>
        
        <div class="detail-item">
            <i class="wi wi-cloudy detail-icon"></i>
            <div class="detail-info">
                <div class="detail-label">Cloud Cover</div>
                <div class="detail-value">${weatherData.cloudcover}%</div>
            </div>
        </div>
        
        <div class="detail-item">
            <i class="wi wi-barometer detail-icon"></i>
            <div class="detail-info">
                <div class="detail-label">Pressure</div>
                <div class="detail-value">${weatherData.pressure} mb</div>
            </div>
        </div>
    </div>
`;

// Generate HTML for hourly forecast
const generateHourlyHTML = (weatherData, isFahrenheit = false) => {
    const currentHour = new Date().getHours();
    const filteredHourly = weatherData.hourly.filter((_, index) => index >= currentHour);
    
    return `
    <div class="hourly-forecast">
        <h3>Hourly Forecast</h3>
        <div class="hourly-scroll">
            ${filteredHourly.map((hour, index) => {
                const forecastHour = (currentHour + index) % 24;
                const isCurrentHour = index === 0; // Check if this is the current hour
                return `
                    <div class="hour-item ${isCurrentHour ? 'current-hour' : ''}">
                        <div class="hour-time">${forecastHour}:00</div>
                        <div class="hour-temp">${convertTemp(hour.temp, isFahrenheit)}°${isFahrenheit ? 'F' : 'C'}</div>
                        <div class="hour-precip">${hour.precipitation}%</div>
                        <div class="hour-conditions">
                            <i class="wi ${hour.icon}"></i>
                        </div>
                        <div class="hour-wind">
                            ${hour.windSpeed} km/h
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    </div>
`;
};

const formatTime = (datetime) => {
    try {
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'N/A';
    }
};

const generateDailyHTML = (weatherData, isFahrenheit = false) => `
    <div class="daily-forecast">
        <h3>Daily Forecast</h3>
        ${weatherData.daily.map(day => {
            // Format the date properly
            const date = new Date(day.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            return `
                <div class="day-item">
                    <div class="day-date">${formattedDate}</div>
                    <div class="day-conditions">
                        <i class="wi ${getWeatherIcon(day.conditions)}"></i>
                        ${day.conditions}
                    </div>
                    <div class="day-temps">
                        <span class="high">${convertTemp(day.tempMax, isFahrenheit)}°</span>
                        <span class="low">${convertTemp(day.tempMin, isFahrenheit)}°</span>
                    </div>
                </div>
            `;
        }).join('')}
    </div>
`;

// Main weather display function
const displayWeather = (weatherData, isFahrenheit = false) => {
    currentWeatherData = weatherData;
    const weatherDisplay = document.getElementById('weather-display');
    weatherDisplay.innerHTML = `
        <div class="weather-card">
            <div class="weather-info">
                ${generateMainInfoHTML(weatherData, isFahrenheit)}
                ${generateForecastHTML(weatherData, isFahrenheit)}
                ${generateHourlyHTML(weatherData, isFahrenheit)}
                ${generateDailyHTML(weatherData, isFahrenheit)}
                ${generateDetailsHTML(weatherData)}
            </div>
        </div>
    `;
};

document.getElementById('unitToggle').addEventListener('change', (e) => {
    const isFahrenheit = e.target.checked;
    if (currentWeatherData) {
        displayWeather(currentWeatherData, isFahrenheit);
    }
});

// Event listener for form submission
document.getElementById('weatherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.getElementById('location').value;
    const weatherData = await fetchWeather(location);
    
    if (weatherData) {
        displayWeather(weatherData);
    }
});