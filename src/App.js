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
        <div id="tooltip" className="ui-panel"></div>
        <div id="canvasBox">
          <canvas ref="canvas" id="drawingArea" width={300} height={300} />
        </div>
        <div id="pointListBox" className="ui-panel"></div>
        <div id="shapeListBox" className="ui-panel"></div>
        <div id="rightBox">
          <div id="propsBox" className="ui-panel">
            <select id="shapeTypeSelect"></select>
            <div id="pointPropsBox" className="props-box">
              <p className="prop-header">Point</p>
              <div className="prop-group">
                <label><input type="number" step="any" id="pxProp" className="prop-window-item"></input>position x</label><br />
                <label><input type="number" step="any" id="pyProp" className="prop-window-item"></input>position y</label><br />
              </div>
              <div className="prop-group">
                <label><input type="number" step="any" id="oxProp" className="prop-window-item"></input>origin x</label><br />
                <label><input type="number" step="any" id="oyProp" className="prop-window-item"></input>origin y</label><br />
              </div>
              <div className="prop-group">
                <label><input type="number" step="any" id="rProp" className="prop-window-item"></input>rotation</label><br />
              </div>
              <div className="prop-group">
                <label><input type="number" step="0.1" id="sxProp" className="prop-window-item"></input>scale x</label><br />
                <label><input type="number" step="0.1" id="syProp" className="prop-window-item"></input>scale y</label><br />
              </div>
            </div>
            <div id="polygonPropsBox" className="props-box">
              <hr />
              <label><input type="color" id="pcProp" className="prop-window-item"></input>color</label><br />
            </div>
            <div id="linePropsBox" className="props-box">
              <hr />
              <label><input type="color" id="lcProp" className="prop-window-item"></input>color</label><br />
            </div>
            <div id="circleFPropsBox" className="props-box">
              <hr />
              <div className="prop-group">
                <label><input type="number" step="any" id="cfrProp" className="prop-window-item" min="0"></input>radius</label><br />
              </div>
              <div className="prop-group">
                <label><input type="color" id="cfcProp" className="prop-window-item"></input>color</label><br />
              </div>
            </div>
            <div id="circleOPropsBox" className="props-box">
              <hr />
              <div className="prop-group">
                <label><input type="number" step="any" id="corProp" className="prop-window-item" min="0"></input>radius</label><br />
              </div>
              <div className="prop-group">
                <label><input type="color" id="cocProp" className="prop-window-item"></input>color</label><br />
              </div>
            </div>
            <div id="bezierPropsBox" className="props-box">
              <hr />
              <label><input type="color" id="bcProp" className="prop-window-item"></input>color</label><br />
            </div>
          </div>
          <div id="keyframeBox" className="ui-panel">
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<CanvasComponent />, document.getElementById('root'));
export default CanvasComponent;