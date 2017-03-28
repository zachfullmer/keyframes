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
        <div id="pointListContainer" className="ui-panel"></div>
        <div id="shapeListContainer" className="ui-panel"></div>
        <div id="propertiesContainer" className="ui-panel">
          <div id="pointPropertiesContainer">
            <div className="prop-group">
              <label><input type="number" id="pxProp"></input>position x</label><br />
              <label><input type="number" id="pyProp"></input>position y</label><br />
            </div>
            <div className="prop-group">
              <label><input type="number" id="oxProp"></input>origin x</label><br />
              <label><input type="number" id="oyProp"></input>origin y</label><br />
            </div>
            <div className="prop-group">
              <label><input type="number" id="rProp"></input>rotation</label><br />
            </div>
            <div className="prop-group">
              <label><input type="number" id="sxProp" step="0.1"></input>scale x</label><br />
              <label><input type="number" id="syProp" step="0.1"></input>scale y</label><br />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<CanvasComponent />, document.getElementById('root'));
export default CanvasComponent;