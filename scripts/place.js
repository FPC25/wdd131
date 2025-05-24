// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// Speed conversion function
function mphToKmh(mph) {
    return mph * 1.60934;
}

// Wind chill calculation function
function calculateWindChill(tempF, windSpeed) {
    // Check conditions for wind chill calculation
    if (tempF <= 50 && windSpeed > 3) {
        // Wind chill formula
        return Math.round(35.74 + (0.6215 * tempF) - 
                        (35.75 * Math.pow(windSpeed, 0.16)) + 
                        (0.4275 * tempF * Math.pow(windSpeed, 0.16)));
    }
    return "N/A";
}

// Static weather data (for now)
const currentTemp = 10; // °C
const currentTempUnit = "C"; // Celsius
const windSpeed = 5;    // Km/h
const windSpeedUnit = "km/h"; // Kilometers per hour

// DOM elements
const tempElement = document.querySelector("#temperature");
const conditionElement = document.querySelector("#condition");
const windSpeedElement = document.querySelector("#windspeed");
const windChillElement = document.querySelector("#windchill");

const currentYear = document.querySelector("#currentYear");
const lastModified = document.querySelector("#lastModified");

// Display static weather data
conditionElement.textContent = "Cloudy";

let temp;
let speed;

if (currentTempUnit === "C" && windSpeedUnit === "km/h") {
    tempElement.textContent = `${currentTemp}°C`;
    windSpeedElement.textContent = `${windSpeed} km/h`;

    temp = celsiusToFahrenheit(currentTemp);
    speed = mphToKmh(windSpeed);

} else if (currentTempUnit === "F" && windSpeedUnit === "Mph") {
    tempElement.textContent = `${currentTemp}°F`;
    windSpeedElement.textContent = `${windSpeed} mph`;

    temp = currentTemp;
    speed = windSpeed;
}

const windChillF = calculateWindChill(temp, speed);
if (windChillF !== "N/A") {
    if (currentTempUnit === "C") {
        windChillElement.textContent = `${fahrenheitToCelsius(windChillF).toFixed(1)} °C`;
    } else{
        windChillElement.textContent = `${windChillF.toFixed(1)} °F`;
    }
} else {
    windChillElement.textContent = "N/A";
}

// Date information
const today = new Date();
currentYear.textContent = today.getFullYear();
lastModified.textContent = `Last Modification: ${document.lastModified}`;