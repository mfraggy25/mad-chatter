import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ImageBackground,
  Platform,
} from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import KeyboardSpacer from "react-native-keyboard-spacer";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    messages: [],
  };

  //Set navigation title as username instead of "Chat"
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name,
    };
  };

  // Change bubble color
  renderBubble(props) {
    {
      /* Colour options
      '#e67e22', // carrot
      '#2ecc71', // emerald
      '#3498db', // peter river
      '#8e44ad', // wisteria
      '#e74c3c', // alizarin
      '#1abc9c', // turquoise
      '#2c3e50', // midnight blue
       https://coolors.co/ */
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#e67e22",
          },
          right: {
            backgroundColor: "#2ecc71",
          },
        }}
      />
    );
  }

  // Set state with a static message
  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: "Hello there!",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
        {
          _id: 2,
          text: "This is a system message",
          createdAt: new Date(),
          system: true,
        },
      ],
    });
  }

  // Send message function
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: this.props.navigation.state.params.color,
        }}
      >
        <Text> Hello {this.props.navigation.state.params.name}</Text>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {/* Keyboard spacer for android only. */}
        {Platform.OS === "android" ? <KeyboardSpacer /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Sets the width and height of the device
    color: "#FFFFFF",
    backgroundColor: "#000000",
  },
});
