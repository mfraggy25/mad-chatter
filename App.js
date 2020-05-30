import React from "react";
import { StyleSheet, Text, View } from "react-native";

//Import screens
import Chat from "./components/Chat";
import Start from "./components/Start";

//Import navigation
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { decode, encode } from "base-64";

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

const navigator = createStackNavigator({
  Start: {
    screen: Start,
    navigationOptions: {
      //hide navigation bar on Start screen
      headerShown: false,
    },
  },
  Chat: { screen: Chat },
});

const navigatorContainer = createAppContainer(navigator);

export default navigatorContainer;
