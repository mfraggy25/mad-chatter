/* eslint-disable react/jsx-filename-extension */
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Platform,
  AsyncStorage,
  YellowBox,
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import KeyboardSpacer from "react-native-keyboard-spacer";
import NetInfo from "@react-native-community/netinfo";
import MapView from "react-native-maps";
import _ from "lodash";
import CustomActions from "./CustomActions";

const firebase = require("firebase");
require("firebase/firestore");

// Remove warning message "setting a timer"
YellowBox.ignoreWarnings(["Setting a timer"]);
const _console = _.clone(console);
console.warn = (message) => {
  if (message.indexOf("Setting a timer") <= -1) {
    _console.warn(message);
  }
};

export default class Chat extends Component {
  // pulling in information from Start.js name/color
  static navigationOptions = ({ navigation }) => ({
    name: navigation.state.params.name,
  });

  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
      image: null,
      location: null,
    };

    firebase.initializeApp({
      apiKey: "AIzaSyCjLX-69Z5JFTiRXnR5sQFShoyyXjXTOIs",
      authDomain: "",
      databaseURL: " ",
      projectId: "mad-chatter-b91ae",
      storageBucket: "mad-chatter-b91ae.appspot.com",
      messagingSenderId: "502456412571",
      appId: "1:502456412571:web:9750deae42e530309a993e",
      measurementId: "G-V7010CSCDR",
    });
    this.referenceMessages = firebase.firestore().collection("messages");
  }

  // Display elements
  componentDidMount() {
    NetInfo.fetch().then((state) => {
      // console.log('Connection type', state.type);
      if (state.isConnected) {
        // console.log('Is connected?', state.isConnected);
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              try {
                await firebase.auth().signInAnonymously();
              } catch (error) {
                console.log(`Cannot sign in: ${error.message}`);
              }
            }
            this.setState({
              uid: user.uid,
              loggedInText: "Hello there",
              isConnected: true,
              user: {
                _id: user.uid,
                name: this.props.navigation.state.params.name,
              },
            });
            // console.log(user);
            this.unsubscribe = this.referenceMessages
              .orderBy("createdAt", "desc")
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        this.setUser(user.uid, this.props.navigation.state.params.name);
        this.setState({
          isConnected: false,
        });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    // Stop listening for authentication
    this.authUnsubscribe();
    // Stop listening for changes
    this.unsubscribe();
  }

  /**
   * updates the state based on firestore collection update
   * @function onCollectionUpdate
   * @param {string} _id
   * @param {string} text
   * @param {date} createdAt
   * @param {object} user
   * @param {string} image
   * @param {location} location
   */
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Go through each document
    querySnapshot.forEach((doc) => {
      // Get queryDocumentSnapshot's data
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || "",
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || "",
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  };

  /**
   * sets default data for a user if none is provided
   * @params {string} _id
   * @params {string} name
   * @params {string} avatar
   */
  setUser = (
    _id,
    name = "Guest User",
    avatar = "https://placeimg.com/140/140/any"
  ) => {
    this.setState({
      user: {
        _id,
        name,
        avatar,
      },
    });
  };

  /*= ==============MESSAGE OPTIONS================ */

  /**
   * loads all messages from AsyncStorage
   * @function getMessages
   * @async
   * @return {Promise<string>} The data from the storage
   */
  async getMessages() {
    let messages = [];
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // Send message
  onSend = (messages = []) => {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  };

  /**
   * Adds the message the firebase database
   * @function addMessage
   * @param {number} _id
   * @param {string} text
   * @param {date} createdAt
   * @param {string} user
   * @param {image} image
   * @param {number} location
   */ addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
      image: this.state.messages[0].image || "",
      location: this.state.messages[0].location || null,
    });
  }

  /**
   * saves all messages to AsyncStorage
   * @function saveMessages
   * @async
   * @return {Promise<string>} The data is saved to the storage
   */
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * deletes messages from AsyncStorage not currently used in app
   * @function deleteMessages
   * @async
   * @return {Promise<string>} The data is deleted from the storage
   */
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  }

  /*= ==============RENDERING================ */

  // Change bubble colour >>> https://coolors.co/
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#8e44ad",
          },
          right: {
            backgroundColor: "#2ecc71",
          },
        }}
      />
    );
  }

  // hide inputbar when offline
  renderInputToolbar(props) {
    if (this.state.isConnected) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  // Custom actions to take picture/upload image/share location
  renderCustomActions = (props) => <CustomActions {...props} />;

  // Show map location
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: this.props.navigation.state.params.color },
        ]}
      >
        <GiftedChat
          scrollToBottom
          renderAvatarOnTop
          user={this.state.user}
          messages={this.state.messages}
          renderCustomView={this.renderCustomView}
          renderActions={(props) => this.renderCustomActions(props)}
          onSend={(messages) => this.onSend(messages)}
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
        />
        {Platform.OS === "android" ? <KeyboardSpacer topSpacing={-50} /> : null}
      </View>
    );
  }
}

/*= ==============STYLING================ */

const styles = StyleSheet.create({
  container: {
    flex: 1, // Sets the width and height of the device
    color: "#FFFFFF",
    backgroundColor: "#000000",
  },
});
