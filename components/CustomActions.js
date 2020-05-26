import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";

import firebase from "firebase";

import { MapView } from "react-native-maps";

import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export default class CustomActions extends React.Component {
  constructor() {
    super();
  }

  //Choose photo from library
  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status === "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      }).catch((error) => console.log(error));

      if (!result.cancelled) {
        const imageUrl = await this.uploadImage(result.uri);
        this.props.onSend({ image: imageUrl });
      }
    }
  };

  //Take photo
  takePhoto = async () => {
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA_ROLL,
      Permissions.CAMERA
    );
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      }).catch((error) => console.log(error));

      if (!result.cancelled) {
        const imageUrlLink = await this.uploadImage(result.uri);
        this.props.onSend({ image: imageUrlLink });
      }
    }
  };

  // upload image to Storage with XMLHttpRequest
  uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const getImageName = uri.split("/");
    const imageArrayLength = getImageName.length - 1;
    const ref = firebase.storage().ref().child(getImageName[imageArrayLength]);
    console.log(ref, getImageName[imageArrayLength]);
    const snapshot = await ref.put(blob);

    blob.close();
    const imageURL = await snapshot.ref.getDownloadURL();
    return imageURL;
  };

  //Sending location
  getLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === "granted") {
      let result = await Location.getCurrentPositionAsync({});
      const longitude = JSON.stringify(result.coords.longitude);
      const latitude = JSON.stringify(result.coords.latitude);
      if (result) {
        this.props.onSend({
          location: {
            longitude: result.coords.longitude,
            latitude: result.coords.latitude,
          },
        });
      }
    }
  };

  onActionsPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log("user wants to pick an image");
            this.pickImage();
            return;
          case 1:
            console.log("user wants to take a photo");
            this.takePhoto();
            return;
          case 2:
            console.log("user wants to get his location");
            this.getLocation();
            return;
        }
      }
    );
  };

  render() {
    return (
      <TouchableOpacity
        style={[styles.container]}
        onPress={this.onActionPress}
        accessible={true}
        accessibilityLabel="More actions"
        accessibilityHint="Allows you to send an image or your geolocation"
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
