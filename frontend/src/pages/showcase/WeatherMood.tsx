import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';

const WeatherMood = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Reverse geocoding
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1`);
          const geoData = await geoRes.json();
          const city = geoData.results?.[0]?.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocationName(city);
          // const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`);
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&hourly=relativehumidity_2m,pressure_msl`);
          const data = await weatherRes.json();
          // setWeather(data.current_weather);
          setWeather({
            ...data.current_weather,
            humidity: data.hourly.relativehumidity_2m?.[0],
            pressure: data.hourly.pressure_msl?.[0],
          });

          setLoading(false);
        },
        () => {
          setLocationName('Newark, NJ');
          fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7357&longitude=-74.1724&current_weather=true&temperature_unit=fahrenheit')
            .then(res => res.json())
            .then(data => { setWeather(data.current_weather); setLoading(false); });
        }
      );
    }
  }, []);

  const getMood = (temp: number) => {
    if (temp <= 32) return '❄️ Chilly – perfect for hot cocoa and coding.';
    if (temp >= 85) return '🥵 Sizzling! Stay hydrated.';
    return '🌞 Pleasant weather – great for creative work.';
  };

  return (
    <PublicLayout title="🌤️ Weather Mood">
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        {loading ? (
          <p>Loading your weather...</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold">{locationName}</h2>
            <div className="text-6xl my-4">{weather.temperature}°F</div>
            <p className="text-gray-600">Wind: {weather.windspeed} mph</p>
            <p className="text-gray-600">Humidity: {weather.humidity ?? '--'}%</p>
            <p className="text-gray-600">Pressure: {weather.pressure ?? '--'} hPa</p>
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-lg">{getMood(weather.temperature)}</p>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default WeatherMood;