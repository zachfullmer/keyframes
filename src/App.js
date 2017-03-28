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
        <div id="canvasBox">
          <canvas ref="canvas" id="drawingArea" width={300} height={300} />
        </div>
        <div id="pointListBox" className="ui-panel"></div>
        <div id="shapeListBox" className="ui-panel"></div>
        <div id="propsBox" className="ui-panel">
          <div id="pointPropsBox" className="props-box">
            <p className="prop-header">Point</p>
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
          <div id="polygonPropsBox" className="props-box">
            <p className="prop-header">Polygon</p>
            <label><input type="color" id="pcProp"></input>color</label><br />
          </div>
          <div id="linePropsBox" className="props-box">
            <p className="prop-header">Line</p>
            <label><input type="color" id="lcProp"></input>color</label><br />
          </div>
          <div id="circleFPropsBox" className="props-box">
            <p className="prop-header">Filled Circle</p>
            <label><input type="number" id="cfrProp"></input>radius</label><br />
            <label><input type="color" id="cfcProp"></input>color</label><br />
          </div>
          <div id="circleOPropsBox" className="props-box">
            <p className="prop-header">Circle</p>
            <label><input type="number" id="corProp"></input>radius</label><br />
            <label><input type="color" id="cocProp"></input>color</label><br />
          </div>
          <div id="bezierPropsBox" className="props-box">
            <p className="prop-header">Bezier Curve</p>
            <label><input type="color" id="bcProp"></input>color</label><br />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<CanvasComponent />, document.getElementById('root'));
export default CanvasComponent;