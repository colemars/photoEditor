import React from 'react';
import PropTypes from 'prop-types';
import '../../css/RangeSlider.css';
import { connect } from "react-redux";
import { updateZoomValue } from "../actions/index";


const dimensions = {
    thumbHeight: 30,
    sliderHeight: 300
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
            currentValue: 0
        }

        this.lastValue = null;
        this.currentValue = null;

        this.handleSlide = this.handleSlide.bind(this);
    }

    updateSlider(element) {
        if (element) {
            this.setState({lastValue: this.props.currentZoomValue});
            this.props.updateZoomValue(Number(element.value));
            this.setState({currentValue: Number(element.value)});
            this.setState({textContent : this.props.currentZoomValue + '%'})

            if (this.state.lastValue === this.props.currentZoomValue) {
                return; // No value change, no need to update then
            }
            
            let barPct = this.props.currentZoomValue * ((dimensions.sliderHeight - dimensions.thumbHeight ) / dimensions.sliderHeight);
            
            this.setState({rangeSliderHeight: 'calc(' + barPct + '% + ' + dimensions.thumbHeight  / 2 + 'px)'});
            styles.bar = {...styles.bar, height: this.state.rangeSliderHeight};
            styles.thumb = {...styles.thumb, bottom: barPct + '%'};

            this.forceUpdate();
        }
    }

    handleSlide(event){
        this.updateSlider(event.target);
        this.props.handleSlide(this.props.currentZoomValue-this.state.lastValue);   
    }

    componentDidUpdate(){
    }

    componentDidMount() {
        var input = [].slice.call(document.querySelectorAll('.range-slider input'))[0];
        input.setAttribute('value', '0');
        this.updateSlider(input);
        // Cross-browser support where value changes instantly as you drag the handle, therefore two event types.
        input.addEventListener('input', this.handleSlide, false);
        input.addEventListener('change', this.handleSlide, false);
    }

    render() {
        return (
            <div className="range-slider" style={styles.rangeSlider}>
                <input type="range" orient="vertical" min="0" max="100" />
                <div className="range-slider__bar" style={styles.bar}></div>
                <div className="range-slider__thumb" style={styles.thumb}>{this.state.textContent}</div>
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
    updateZoomValue: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(RangeSlider);
