import { TbMapSearch, TbSearch, TbMoon, TbSun } from 'react-icons/tb';
import { RiCelsiusFill, RiFahrenheitFill } from 'react-icons/ri';
import { useState, useMemo } from 'react';
import DetailsCard from './components/DetailsCard';
import SummaryCard from './components/SummaryCard';
import { useTranslation } from 'react-i18next';
import './languages/i18n';

import Astronaut from './asset/not-found.svg';
import SearchPlace from './asset/search.svg';
import BackgroundColor from './components/BackgroundColor';

import axios from 'axios';

function App() {
  const API_KEY = "2048be5f0610312a0472a90ce220fd57"
  const { t, i18n } = useTranslation();

  const [noData, setNoData] = useState(t('no-data'));
  const [searchTerm, setSearchTerm] = useState('');
  const [weatherData, setWeatherData] = useState([]);
  const [city, setCity] = useState(t('unknown-location'));
  const [weatherIcon, setWeatherIcon] = useState(
    `https://openweathermap.org/img/wn/10n@2x.png`
  );
  const [currentLanguage, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isFahrenheitMode, setIsFahrenheitMode] = useState(false);

  const degreeSymbol = useMemo(
    () => (isFahrenheitMode ? '\u00b0F' : '\u00b0C'),
    [isFahrenheitMode]
  );

  const toggleDark = () => {
    let mode = localStorage.getItem('mode');
    if (mode === null) mode = 'light';
    document.body.classList.toggle('dark');

    mode === 'light' ? (mode = 'dark') : (mode = 'light');

    localStorage.setItem('mode', mode);
  };

  const toggleFahrenheit = () => {
    setIsFahrenheitMode(!isFahrenheitMode);
  };

  const handleChange = (input) => {
    const { value } = input.target;
    setSearchTerm(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getWeather(searchTerm);
  };

  const handleLanguage = (event) => {
    changeLanguage(event.target.value);
  };

  const changeLanguage = (value, location) => {
    i18n
      .changeLanguage(value)
      .then(() => setLanguage(value) && getWeather(location))
      .catch((err) => console.log(err));
  };

  const getWeather = async (location) => {
    setLoading(true);
    setWeatherData([]);
    let how_to_search =
      typeof location === 'string'
        ? `q=${location}`
        : `lat=${location[0]}&lon=${location[1]}`;

    const url = 'https://api.openweathermap.org/data/2.5/forecast?';
    axios
      .post(
        `${url}${how_to_search}&appid=${API_KEY}&units=metric&cnt=5&exclude=hourly,minutely`
      )
      .then((response) => {
        setWeatherData(response.data);
        setLoading(false);
        setCity(`${response.data.city.name}, ${response.data.city.country}`);
        setWeatherIcon(
          `${
            'https://openweathermap.org/img/wn/' +
            response.list[0].weather[0]['icon']
          }@4x.png`
        );
        setTimeout(() => {
          checkMode();
        }, 2000);
      })
      .catch((error) => {
        setNoData('Location Not Found');
        setLoading(false);
      });
  };

  const myIP = (location) => {
    const { latitude, longitude } = location.coords;
    getWeather([latitude, longitude]);
  };

  // load current location weather info on load
  window.addEventListener('load', function () {
    navigator.geolocation.getCurrentPosition(myIP);
  });

  const checkMode = () => {
    const mode = localStorage.getItem('mode');
    if (mode !== null && mode === 'dark') {
      document.getElementById('checkbox').checked = true;
      document.body.classList.toggle('dark');
    }
  };

  return (
    <div className='container' onLoad={checkMode}>
      <div
        className='blur'
        style={{
          background: `${
            weatherData ? BackgroundColor(weatherData) : '#a6ddf0'
          }`,
          top: '-10%',
          right: '0',
        }}
      ></div>
      <div
        className='blur'
        style={{
          background: `${
            weatherData ? BackgroundColor(weatherData) : '#a6ddf0'
          }`,
          top: '36%',
          left: '-6rem',
        }}
      ></div>
      <div className='content'>
        <div className='form-container'>
          <div className='name'>
            <div className='toggle-container'>
              <input
                type='checkbox'
                className='checkbox'
                id='checkbox'
                onChange={toggleDark}
              />
              <label htmlFor='checkbox' className='label'>
                <TbMoon
                  style={{
                    color: '#a6ddf0',
                  }}
                />
                <TbSun
                  style={{
                    color: '#f5c32c',
                  }}
                />
                <div className='ball' />
              </label>
            </div>
            <div className='city'>
              <TbMapSearch />
              <p>{city}</p>
            </div>
          </div>
          <div className='search'>
            <h2>{t('title')}</h2>
            <hr />
            <form className='search-bar' noValidate onSubmit={handleSubmit}>
              <input
                type='text'
                name=''
                id=''
                placeholder={t('explore')}
                onChange={handleChange}
                required
              />
              <button
                className='s-icon'
                style={{
                  color: '#a6ddf0',
                }}
              >
                <TbSearch
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(myIP);
                  }}
                />
              </button>
            </form>
          </div>
        </div>
        <div className='info-container'>
          <div className='info-inner-container'>
            <select
              className='selected-languange'
              value={currentLanguage}
              onChange={(e) => handleLanguage(e)}
            >
              <option selected value='en'>
                {t('languages.en')}
              </option>
              <option value='ru'>{t('languages.ru')}</option>
            </select>
            <div className='toggle-container'>
              <input
                type='checkbox'
                className='checkbox'
                id='fahrenheit-checkbox'
                onChange={toggleFahrenheit}
              />
              <label htmlFor='fahrenheit-checkbox' className='label'>
                <RiFahrenheitFill />
                <RiCelsiusFill />
                <div className='ball' />
              </label>
            </div>
          </div>
          {loading ? (
            <div className='loader'></div>
          ) : (
            <span>
              {weatherData.length === 0 ? (
                <div className='nodata'>
                  <h1>{noData}</h1>
                  {noData === 'Location Not Found' ? (
                    <>
                      <img
                        src={Astronaut}
                        alt='an astronaut lost in the space'
                      />
                      <p>{t('we-lost')}</p>
                    </>
                  ) : (
                    <>
                      <img
                        src={SearchPlace}
                        alt='a person thinking about what place to find'
                      />
                      <p style={{ padding: '20px' }}>{t('iydnws')}</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <h1 className='centerTextOnMobile'>{t('today')}</h1>
                  <DetailsCard
                    weather_icon={weatherIcon ? weatherIcon : null}
                    data={weatherData ? weatherData : null}
                    isFahrenheitMode={
                      isFahrenheitMode ? isFahrenheitMode : null
                    }
                    degreeSymbol={degreeSymbol ? degreeSymbol : null}
                  />
                  <h1 className='title centerTextOnMobile'>
                    {t('more-on')} {city}
                  </h1>
                  <ul className='summary'>
                    {weatherData.list.map((days, index) => (
                      <SummaryCard
                        key={index}
                        day={days ? days : null}
                        isFahrenheitMode={
                          isFahrenheitMode ? isFahrenheitMode : null
                        }
                        degreeSymbol={degreeSymbol ? degreeSymbol : null}
                      />
                    ))}
                  </ul>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
