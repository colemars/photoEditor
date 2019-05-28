import React from "react";
import PropTypes from "prop-types";
import PhotoEditor from "../components/PhotoEditor";
import RangeSlider from "../components/RangeSlider";
import { connect } from "react-redux";
import { updatePct } from "../actions/index";
import { updateZoomValue } from "../actions/index";

const styles = {
  canvas: {
    boxShadow: "rgba(41,41,41,1) 0px 0px 4px"
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5vh"
  }
};

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      zoomValue: 0
    };

    this.photoEditor = new PhotoEditor(this.props.currentZoomValue);
    this.handleSlide = this.handleSlide.bind(this);
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
  }

  handleSlide(val) {
    this.props.updatePct(val);
    this.zoomValue = val;
    this.photoEditor.slideZoom(val);
  }

  handleZoom(scale) {
    this.props.updateZoomValue(scale * 25);
    this.setState({ zoomValue: scale * 25 });
  }

  handleImageLoad() {
    this.forceUpdate();
  }

  componentDidMount() {
    this.photoEditor.init(this.handleZoom, this.handleImageLoad);
  }

  render() {
    return (
      <div className="container" style={styles.container}>
        <canvas id={"canvas"} style={styles.canvas} />
        <RangeSlider
          handleSlide={this.handleSlide}
          zoomValue={this.state.zoomValue}
        />
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    lastX: state.lastX,
    lastY: state.lastY,
    pct: state.pct,
    currentZoomValue: state.currentZoomValue
  };
};

function mapDispatchToProps(dispatch) {
  return {
    updatePct: pct => dispatch(updatePct(pct)),
    updateZoomValue: val => dispatch(updateZoomValue(val))
  };
}

Home.propTypes = {
  lastX: PropTypes.number.isRequired,
  lastY: PropTypes.number.isRequired,
  pct: PropTypes.number.isRequired,
  updatePct: PropTypes.func.isRequired,
  currentZoomValue: PropTypes.number.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
