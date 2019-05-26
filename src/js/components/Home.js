import React from 'react';
import PropTypes from 'prop-types';
import PhotoEditor from '../components/PhotoEditor';


const height = 450;
const width = 600;
const OPTIONS = {
  backgroundColor: 0x3D9CA8
};

const styles = {
  canvas: {
    boxShadow: 'rgba(41,41,41,1) 1px 1px 10px',
    marginTop: '5vh'
  },
};

export default class Home extends React.Component {
  constructor(props){
    super(props);
  }

  componentDidMount(){
      let photoEditor = new PhotoEditor();
      photoEditor.init();
  }

  render() {
    return (
     <canvas id={'canvas'} style = {styles.canvas}></canvas>
    );
  }
}