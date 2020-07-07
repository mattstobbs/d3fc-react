import React from 'react';
import ReactDOM from 'react-dom';
import { Canvas } from './reconciler';
import './styles.css';

ReactDOM.render(
  <Canvas>
    <seriesCanvasPoint />
  </Canvas>,
  document.getElementById('root')
);
