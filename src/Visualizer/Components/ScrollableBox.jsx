import React, { Component } from 'react';
import './Components.css';

class ScrollableBox extends Component {
  render() {
    const { children, height } = this.props;
    const styles = {
      height: `${height}px`,
      overflowY: 'auto',
      color: 'white',
      border: '2px solid white',
      borderRadius: '10px',
      padding: '10px',
      boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      width: '90%',
      margin: '20px auto 0',
    };

    return (
      <div id="userLevelsContainer" style={styles}>
        {children}
      </div>
    );
  }
}

export default ScrollableBox;
