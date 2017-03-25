import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import { initCanvas } from './Canvas.js'
import { initEvents } from './Events.js'
import { initUI } from './UI.js'


class CanvasComponent extends React.Component {
  componentDidMount() {
    initUI();
    initEvents();
    const ctx = this.refs.canvas.getContext('2d');
    initCanvas(ctx);
  }
  render() {
    return (
      <div>
        <div id="canvasContainer">
          <canvas ref="canvas" id="drawingArea" width={300} height={300} />
        </div>
        <div id="pointListContainer">
        </div>
      </div>
    );
  }
}

ReactDOM.render(<CanvasComponent />, document.getElementById('root'));
export default CanvasComponent;