import React from 'react';
import { View, TouchableOpacity, UIManager, findNodeHandle, StyleSheet } from 'react-native';
import { Icon } from 'native-base';


class PopupMenu extends React.Component {
  handleShowPopupError = () => {
    // show error here
  };

  handleMenuPress = () => {
    const { actions, onPress } = this.props;

    UIManager.showPopupMenu(
      findNodeHandle(this.refs.menu),
      actions,
      this.handleShowPopupError,
      onPress,
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.props.children}
        <TouchableOpacity onPress={this.handleMenuPress} style={styles.menu}>
          <Icon
            ref="menu"
            style={styles.icone}
            type="FontAwesome5"
            name="ellipsis-v"
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  icone: {
    color: '#FFFFFF',
    fontSize: 18
  },
  menu: {
    top: -5,
    width: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
});

export default PopupMenu;
