import React, { Component } from 'react';
import './Components.css';

const SCROLLBAR_IDLE_DELAY = 800;

class ScrollableBox extends Component {
  state = {
    isScrolling: false,
  };

  componentWillUnmount() {
    clearTimeout(this.scrollbarIdleTimer);
  }

  getBoxHeight() {
    const { height } = this.props;
    return typeof height === 'number' ? `${height}px` : height;
  }

  handleScroll = () => {
    clearTimeout(this.scrollbarIdleTimer);

    if (!this.state.isScrolling) {
      this.setState({ isScrolling: true });
    }

    this.scrollbarIdleTimer = setTimeout(() => {
      this.setState({ isScrolling: false });
    }, SCROLLBAR_IDLE_DELAY);
  };

  render() {
    const { children, className = '', style = {} } = this.props;
    const styles = {
      height: this.getBoxHeight(),
      color: 'white',
      border: '2px solid white',
      borderRadius: '10px',
      padding: '10px',
      boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      width: '100%',
      margin: 0,
      ...style,
    };
    const classes = [
      'scrollable-box',
      this.state.isScrolling ? 'scrollable-box--scrolling' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        id="userLevelsContainer"
        className={classes}
        style={styles}
        onScroll={this.handleScroll}
      >
        {children}
      </div>
    );
  }
}

export default ScrollableBox;
