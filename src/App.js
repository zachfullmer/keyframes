import React from 'react'
import ReactDOM from 'react-dom'
import { initCanvas } from './Canvas.js'

class CanvasComponent extends React.Component {
  componentDidMount() {
    const ctx = this.refs.canvas.getContext('2d');
    initCanvas(ctx);
  }
  render() {
    return (
      <div>
        <div id="canvasContainer">
          <canvas ref="canvas" id="drawingArea" width={300} height={300} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<CanvasComponent />, document.getElementById('root'));
export default CanvasComponent;