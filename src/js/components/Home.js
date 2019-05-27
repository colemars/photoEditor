import React from 'react';
import PropTypes from 'prop-types';
import PhotoEditor from '../components/PhotoEditor';
import RangeSlider from '../components/RangeSlider';
import { connect } from "react-redux";
import { updatePct } from "../actions/index";
import { updateZoomValue } from "../actions/index";
import store from '../store';

const styles = {
    canvas: {
        boxShadow: 'rgba(41,41,41,1) 1px 1px 10px',
        marginTop: '5vh'
    },
};

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            zoomValue: 0
        }

        this.photoEditor = new PhotoEditor(this.props.currentZoomValue);

        this.handleSlide = this.handleSlide.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
    }

    handleSlide(val) {
        this.props.updatePct(val);
        this.zoomValue = val;

        this.photoEditor.slideZoom(val);

        // this.photoEditor.zoom(val);
    }

    handleZoom(scale){        
        this.props.updateZoomValue(scale*25);
        this.setState({zoomValue: scale*25})
    }

    componentDidMount() {
        this.photoEditor.init(this.handleZoom);
    }

    componentDidUpdate() {
        // console.log('update', this.props.pct);
        
        // this.photoEditor.zoom(this.props.pct / 10);
    }

    render() {
        return (
            <div>
                <canvas id={'canvas'} style={styles.canvas}></canvas>
                <RangeSlider handleSlide={this.handleSlide} zoomValue={this.state.zoomValue} />
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
    currentZoomValue: PropTypes.number.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
