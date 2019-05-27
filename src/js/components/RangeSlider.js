import React from 'react';
import PropTypes from 'prop-types';
import '../../css/RangeSlider.css';
import { connect } from "react-redux";
import { updateZoomValue } from "../actions/index";

const dimensions = {
    thumbHeight: 30,
    sliderHeight: window.innerHeight - window.innerHeight / 3
}

let styles = {
    canvas: {
        boxShadow: 'rgba(41,41,41,1) 1px 1px 10px',
        marginTop: '5vh'
    },
    rangeSlider:{
        display: 'inline-block',
        width: '40px',
        position: 'relative',
        textAlign: 'center',
        height: dimensions.sliderHeight + 'px',
        maxHeight: '100%'
    },
    bar:{
        left: '16px',
        bottom: '0',
        position: 'absolute',
        background: 'linear-gradient(dodgerblue, blue)',
        pointerEvents: 'none',
        width: '8px',
        borderRadius: '10px',
        height: '0px'
    },
    thumb: {
        position: 'absolute',
        left: '5px',
        width: dimensions.thumbHeight + 'px',
        height: '30px',
        lineHeight: '30px',
        background: 'white',
        color: '#777',
        fontSize: '50%',
        boxShadow: '0 0 0 4px #3D3D4A',
        borderRadius: '50%',
        pointerEvents: 'none',
        bottom: '0%'
    }
};

class RangeSlider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rangeSliderHeight: '0px',
            barPct: 0,
            textContent: "0%",
            lastValue: 0,
        }

        this.myRef = React.createRef();
        this.lastValue = null;
        this.currentValue = null;

        this.handleSlide = this.handleSlide.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

    }

    updateSlider(){
        this.currentValue = this.props.currentZoomValue;

        if (this.currentValue > 100){
            this.currentValue = 100
        }
        if (this.currentValue < 0){
            this.currentValue = 0
        }
        this.textContent = Math.round(this.currentValue) + '%';   
        let barPct = this.currentValue * ((dimensions.sliderHeight - dimensions.thumbHeight ) / dimensions.sliderHeight);
        let rangeSliderHeight = 'calc(' + barPct + '% + ' + dimensions.thumbHeight  / 2 + 'px)'
        styles.bar = {...styles.bar, height: rangeSliderHeight};
        styles.thumb = {...styles.thumb, bottom: barPct + '%'}; 
    }

    handleSlide(){   
        let zoomVal = Number(this.myRef.current.value)
        this.props.updateZoomValue(zoomVal);
        this.props.handleSlide(zoomVal+10);
    }

    handleMouseUp(){   
       this.forceUpdate();
    }

    componentWillUpdate(){        
        this.updateSlider()
    }

    componentDidUpdate(){
        this.updateSlider()
    }

    componentWillMount(){
        this.textContent = '0%';
        this.updateSlider();
    }

    componentDidMount() {
        // Cross-browser support where value changes instantly as you drag the handle, therefore two event types.
        this.myRef.current.addEventListener('input', this.handleSlide, false);
        this.myRef.current.addEventListener('change', this.handleSlide, false);
        this.myRef.current.addEventListener('mouseup', this.handleMouseUp, false);
    }

    render() {
        return (
            <div className="range-slider" style={styles.rangeSlider}>
                <input type="range" orient="vertical" min="0" max="100" ref = {this.myRef}/>
                <div className="range-slider__bar" style={styles.bar}></div>
                <div className="range-slider__thumb" style={styles.thumb}>{this.textContent}</div>
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
    zoomValue: PropTypes.number.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(RangeSlider);
