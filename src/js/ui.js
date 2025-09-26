const processWeatherData = (data) => {
    return {
        temperature: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
        country: data.sys.country
    };
};

const displayWeather = (weatherData) => {
    const weatherContainer = document.getElementById('weather');
    weatherContainer.innerHTML = `
        <h2>${weatherData.city}, ${weatherData.country}</h2>
        <p>Temperature: ${weatherData.temperature}°C</p>
        <p>Condition: ${weatherData.description}</p>
        <img src="assets/icons/${weatherData.icon}.png" alt="${weatherData.description}">
    `;
};

export { processWeatherData, displayWeather };