import React from "react";
import PropTypes from "prop-types";
import "../../css/RangeSlider.css";
import { connect } from "react-redux";
import { updateZoomValue } from "../actions/index";

const dimensions = {
  thumbHeight: 30,
  sliderHeight: window.innerHeight - window.innerHeight / 3
};

let styles = {
  rangeSlider: {
    display: "inline-block",
    width: "40px",
    position: "relative",
    height: dimensions.sliderHeight + "px",
    maxHeight: "100%",
    backgroundColor: "#D9D9D9",
    border: "solid #D9D9D9 5px",
    borderRadius: "10px",
    boxShadow: "rgba(41,41,41,1) 0px 0px 4px",
    marginLeft: "20px"
  },
  bar: {
    left: "15px",
    bottom: "0",
    position: "absolute",
    background: "linear-gradient(#8C8C8C, #595959)",
    pointerEvents: "none",
    width: "10px",
    borderRadius: "10px",
    height: "0px",
    boxShadow: "rgb(89, 89, 89) 0px 0px 5px 2px inset"
  },
  thumb: {
    cursor: "pointer",
    position: "absolute",
    left: "1px",
    width: dimensions.thumbHeight + "px",
    height: "30px",
    lineHeight: "30px",
    background: "white",
    color: "#777",
    fontSize: "50%",
    borderRadius: "50%",
    pointerEvents: "none",
    bottom: "0%",
    border: "4px solid rgba(204, 204, 204, 0.4)",
    boxShadow: "rgba(41,41,41,1) 0px 0px 4px"
  }
};

class RangeSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rangeSliderHeight: "0px",
      barPct: 0,
      textContent: "0%",
      lastValue: 0
    };

    this.myRef = React.createRef();
    this.lastValue = null;
    this.currentValue = null;

    this.handleSlide = this.handleSlide.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  updateSlider() {
    this.currentValue = this.props.currentZoomValue;

    if (this.currentValue > 100) {
      this.currentValue = 100;
    }
    if (this.currentValue < 0) {
      this.currentValue = 0;
    }
    this.textContent = Math.round(this.currentValue) + "%";
    let barPct =
      this.currentValue *
      ((dimensions.sliderHeight - dimensions.thumbHeight) /
        dimensions.sliderHeight);
    let rangeSliderHeight =
      "calc(" + barPct + "% + " + dimensions.thumbHeight / 2 + "px)";
    styles.bar = { ...styles.bar, height: rangeSliderHeight };
    styles.thumb =
      this.currentValue === 0
        ? { ...styles.thumb, bottom: -1 + "%" }
        : { ...styles.thumb, bottom: barPct + "%" };
  }

  handleSlide() {
    let zoomVal = Number(this.myRef.current.value);
    this.props.updateZoomValue(zoomVal);
    this.props.handleSlide(zoomVal + 10);
  }

  handleMouseUp() {
    this.forceUpdate();
  }

  componentWillUpdate() {
    this.updateSlider();
  }

  componentDidUpdate() {
    this.updateSlider();
  }

  componentWillMount() {
    this.textContent = "0%";
    this.updateSlider();
  }

  componentDidMount() {
    // Cross-browser support where value changes instantly as you drag the handle, therefore two event types.
    this.myRef.current.addEventListener("input", this.handleSlide, false);
    this.myRef.current.addEventListener("change", this.handleSlide, false);
    this.myRef.current.addEventListener("mouseup", this.handleMouseUp, false);
  }

  render() {
    return (
      <div className="range-slider" style={styles.rangeSlider}>
        <input
          type="range"
          orient="vertical"
          min="0"
          max="100"
          ref={this.myRef}
        />
        <div className="range-slider__bar" style={styles.bar} />
        <div className="range-slider__thumb" style={styles.thumb}>
          {this.textContent}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentZoomValue: state.currentZoomValue
  };
};

function mapDispatchToProps(dispatch) {
  return {
    updateZoomValue: val => dispatch(updateZoomValue(val))
  };
}

RangeSlider.propTypes = {
  currentZoomValue: PropTypes.number.isRequired,
  updateZoomValue: PropTypes.func.isRequired,
  zoomValue: PropTypes.number.isRequired,
  handleSlide: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RangeSlider);
