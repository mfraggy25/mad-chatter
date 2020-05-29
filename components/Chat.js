import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ImageBackground,
  Platform,
  AsyncStorage,
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import KeyboardSpacer from "react-native-keyboard-spacer";
import NetInfo from "@react-native-community/netinfo";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends Component {
  //pulling in information from Start.js name/color
  static navigationOptions = ({ navigation }) => {
    return {
      name: navigation.state.params.name,
    };
  };

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
      storageBucket: " ",
      messagingSenderId: "502456412571",
      appId: "1:502456412571:web:9750deae42e530309a993e",
      measurementId: "G-V7010CSCDR",
    });
    this.referenceMessages = firebase.firestore().collection("messages");
  }

  // Display elements
  componentDidMount() {
    NetInfo.fetch().then((state) => {
      //console.log('Connection type', state.type);
      if (state.isConnected) {
        //console.log('Is connected?', state.isConnected);
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              try {
                await firebase.auth().signInAnonymously();
              } catch (error) {
                console.log("Cannot sign in: " + error.message);
              }
            }
            this.setState({
              isConnected: true,
              user: {
                _id: user.uid,
                name: this.props.navigation.state.params.name,
                avatar: "https://placeimg.com/140/140/any",
              },
              uid: user.uid,
              loggedInText:
                this.props.navigation.state.params.name +
                " has entered the chat",
              messages: [],
            });
            //console.log(user);
            this.unsubscribe = this.referenceMessages
              .orderBy("createdAt", "desc")
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
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

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // Go through each document
    querySnapshot.forEach((doc) => {
      // Get queryDocumentSnapshot's data
      var data = doc.data();
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

  get user() {
    return {
      name: this.props.navigation.state.params.name,
      _id: this.state.uid,
      id: this.state.uid,
    };
  }

  /*===============MESSAGE OPTIONS================*/

  // Add message
  addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
      uid: this.state.uid,
      image: this.state.messages[0].image || "",
      location: this.state.messages[0].location || null,
    });
  }

  // Get messages from local(async) storage
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

  // Save messages locally(asyncStorage)
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

  // Delete messages
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  }

  /*===============RENDERING================*/

  // Change bubble colour
  renderBubble(props) {
    {
      /* Colour options
       https://coolors.co/ */
    }
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
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  // Show map location
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
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

/*===============STYLING================*/

const styles = StyleSheet.create({
  container: {
    flex: 1, // Sets the width and height of the device
    color: "#FFFFFF",
    backgroundColor: "#000000",
  },
});
