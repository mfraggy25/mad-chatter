import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "", color: "" }; // creates state for"name" and "color"
  }
  render() {
    return (
      <ImageBackground
        source={require("../assets/BackgroundImage.png")}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>Mad Chatter</Text>
        <View style={styles.container}>
          <TextInput
            style={styles.nameBox}
            onChangeText={(name) => this.setState({ name })}
            value={this.state.name}
            placeholder="Enter Name"
            placeholderTextColor={"black"}
          />
          <Text style={styles.title}>Choose your background colour:</Text>
          <View style={styles.colorBackground}>
            <TouchableOpacity
              onPress={() => this.setState({ color: "#090C08" })}
              style={[styles.color1, styles.colorButton]}
            />
            <TouchableOpacity
              onPress={() => this.setState({ color: "#474056" })}
              style={[styles.color2, styles.colorButton]}
            />
            <TouchableOpacity
              onPress={() => this.setState({ color: "#8A95A5" })}
              style={[styles.color3, styles.colorButton]}
            />
            <TouchableOpacity
              onPress={() => this.setState({ color: "#B9C6AE" })}
              style={[styles.color4, styles.colorButton]}
            />
          </View>
          <Button
            style={styles.button}
            title="Start Chatting"
            onPress={() =>
              this.props.navigation.navigate("Chat", {
                name: this.state.name,
                color: this.state.color,
              })
            }
          />
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "44%",
    width: "88%",
    marginBottom: 20,
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  nameBox: {
    fontSize: 22,
    fontWeight: "800",
    borderWidth: 2,
    color: "#000000",
    borderColor: "#757083",
    width: "88%",
    marginBottom: 20,
    marginTop: 30,
  },
  button: {
    fontSize: 16,
    fontWeight: "300",
    color: "#FFFFFF",
    backgroundColor: "#757083",
    width: "80%",
    marginBottom: 60,
    marginTop: 50,
  },
  color1: {
    backgroundColor: "#090C08",
  },
  color2: {
    backgroundColor: "#474056",
  },
  color3: {
    backgroundColor: "#8A95A5",
  },
  color4: {
    backgroundColor: "#B9C6AE",
  },
  text: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    marginTop: 15,
    marginLeft: 20,
  },
  title: {
    alignItems: "center",
    fontSize: 45,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  colorButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    margin: 10,
  },
  colorBackground: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    margin: 15,
  },
});
