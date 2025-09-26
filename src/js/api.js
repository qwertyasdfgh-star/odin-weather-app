const apiKey = 'DPQZP6YCLR7QH7WY97WBD7Q5Z'; 
const apiUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export const fetchWeather = async (location) => {
    try {
        const response = await fetch(
            `${apiUrl}/${encodeURIComponent(location)}/next7days?unitGroup=metric&key=${apiKey}&contentType=json`
        );
        
        if (response.status === 401) {
            throw new Error('API key is invalid or not yet activated.');
        }
        
        if (!response.ok) {
            throw new Error(`Weather data not found (Status: ${response.status})`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        return processWeatherData(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function processWeatherData(data) {
    return {
        // Current conditions
        location: data.resolvedAddress,
        temperature: Math.round(data.currentConditions.temp),
        conditions: data.currentConditions.conditions,
        humidity: data.currentConditions.humidity,
        windSpeed: Math.round(data.currentConditions.windspeed),
        feelsLike: Math.round(data.currentConditions.feelslike),
        visibility: data.currentConditions.visibility,
        uvIndex: data.currentConditions.uvindex,
        sunrise: formatTime(data.currentConditions.sunrise),
        sunset: formatTime(data.currentConditions.sunset),
        cloudcover: data.currentConditions.cloudcover,
        pressure: data.currentConditions.pressure,
        description: data.description,
        dewPoint: Math.round(data.currentConditions.dew),

        // Hourly forecast for today
        hourly: data.days[0].hours.map(hour => ({
            time: formatTime(hour.datetime),  
            temp: Math.round(hour.temp),
            precipitation: Math.round(hour.precipprob) || 0,
            icon: getWeatherIcon(hour.conditions),
            conditions: hour.conditions,
            windSpeed: Math.round(hour.windspeed),
        })),

        // Today's forecast summary
        todaySummary: {
            tempmax: Math.round(data.days[0].tempmax),
            tempmin: Math.round(data.days[0].tempmin),
            precipprob: Math.round(data.days[0].precipprob) || 0,
            description: data.days[0].description
        },

        // 7-day forecast
        daily: data.days.slice(0, 7).map(day => ({
            date: new Date(day.datetime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }),
            tempMax: Math.round(day.tempmax),
            tempMin: Math.round(day.tempmin),
            conditions: day.conditions,
            icon: getWeatherIcon(day.conditions),
            windSpeed: Math.round(day.windspeed),
            precipitation: Math.round(day.precipprob) || 0
        }))
    };
}

function getWeatherIcon(conditions) {
    const iconMap = {
        'Clear': 'wi-day-sunny',
        'Partially cloudy': 'wi-day-cloudy',
        'Cloudy': 'wi-cloudy',
        'Rain': 'wi-rain',
        'Snow': 'wi-snow',
        'Thunder': 'wi-thunderstorm',
        'Fog': 'wi-fog',
        'Overcast': 'wi-cloudy'
    };
    return iconMap[conditions] || 'wi-day-sunny';
}
