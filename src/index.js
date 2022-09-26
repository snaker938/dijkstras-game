import audioPath from './assets/theme_song.mp3';
import React from 'react';
import ReactDOM from 'react-dom';
import { FirstStart } from './Navigation';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <FirstStart />
  </React.StrictMode>,
  document.getElementById('root')
);

// Play the theme song: Glorious Morning, https://www.waterflame.com/contact-info
// let audio = new Audio(audioPath);
// audio.play();
// audio.loop = true;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
