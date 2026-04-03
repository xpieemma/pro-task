import { useState, useEffect, useRef } from 'react';
import PublicLayout from '../../components/PublicLayout';


  interface WeatherData {
    temperature: number;
    windspeed: number;
    humidity?: number;
    pressure?: number;
  }

const WeatherMood = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('');
    const [error, setError] = useState(false);
  
 const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&hourly=relativehumidity_2m,pressure_msl`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      humidity: data.hourly?.relativehumidity_2m?.[0],
      pressure: data.hourly?.pressure_msl?.[0],
    };
  };
  const loadingRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);


  useEffect(() => {
    let isMounted = true;
let timeoutTriggered = false;

const timeoutId = setTimeout(() => {
      if (isMounted && loadingRef.current && !timeoutTriggered) {
        timeoutTriggered = true;
        // Fallback after 10 seconds
        setLocationName('Newark, NJ');
        fetchWeather(40.7357, -74.1724, 'Newark, NJ')
          .then(weatherData => isMounted && setWeather(weatherData))
          .catch(() => isMounted && setError(true))
          .finally(() => isMounted && setLoading(false));
      }
    }, 10000);
 if (!navigator.geolocation) {
    
      setLocationName('Newark, NJ');
      fetchWeather(40.7357, -74.1724, 'Newark, NJ')
        .then(weatherData => isMounted && setWeather(weatherData))
        .catch(() => isMounted && setError(true))
        .finally(() => isMounted && setLoading(false));
      return () => clearTimeout(timeoutId);
    }
    
    
      navigator.geolocation.getCurrentPosition(
         async (pos) => {
          if (!timeoutTriggered) {
        clearTimeout(timeoutId);
        const { latitude, longitude } = pos.coords;
        // Use coordinates directly (skip broken reverse geocoding)
        const city = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        setLocationName(city);
        try {
          const weatherData = await fetchWeather(latitude, longitude, city);
          if (isMounted) setWeather(weatherData);
        } catch {
          if (isMounted) setError(true);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      },
      () => {
        // Geolocation error (user denied or timeout)
        if (!timeoutTriggered) {
        clearTimeout(timeoutId);
        setLocationName('Newark, NJ');
        fetchWeather(40.7357, -74.1724, 'Newark, NJ')
          .then(weatherData => isMounted && setWeather(weatherData))
          .catch(() => isMounted && setError(true))
          .finally(() => isMounted && setLoading(false));
      }
    }
      );
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const getMood = (temp: number) => {
    if (temp <= 32) return '❄️ Chilly – perfect for hot cocoa and coding.';
    if (temp >= 85) return '🥵 Sizzling! Stay hydrated.';
    return '🌞 Pleasant weather – great for creative work.';
  };

if (error || (!loading && !weather)) {
  return (
    <PublicLayout title="🌤️ Weather Mood">
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-red-600">
        Unable to load weather data. Please try again later.
      </div>
    </PublicLayout>
  );
}

  return (
    <PublicLayout title="🌤️ Weather Mood">
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        {loading ? (
          <p>Loading your weather...</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold">{locationName}</h2>
            <div className="text-6xl my-4">{weather?.temperature}°F</div>
            <p className="text-gray-600">Wind: {weather?.windspeed} mph</p>
            <p className="text-gray-600">Humidity: {weather?.humidity ?? '--'}%</p>
            <p className="text-gray-600">Pressure: {weather?.pressure ?? '--'} hPa</p>
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-lg">{getMood(weather?.temperature || 0)}</p>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default WeatherMood;