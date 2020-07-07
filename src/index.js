import React from 'react';
import ReactDOM from 'react-dom';
import * as fc from 'd3fc';
import * as d3 from 'd3';
import { Canvas } from './reconciler';
import './styles.css';

const data = fc.randomGeometricBrownianMotion().steps(50)(1);
const xScale = d3.scaleLinear().domain([0, data.length - 1]);
const yScale = d3.scaleLinear().domain(fc.extentLinear()(data));

ReactDOM.render(
  <Canvas>
    <seriesCanvasPoint
      xScale={xScale}
      yScale={yScale}
      crossValue={(_, i) => i}
      mainValue={(d) => d}
      data={data}
      context={'2d'}
    />
  </Canvas>,
  document.getElementById('root')
);
