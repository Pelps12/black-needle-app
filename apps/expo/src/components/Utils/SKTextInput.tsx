import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

type FontWeight = "normal" | "medium" | "semi-bold" | "bold";

interface CustomTextProps extends TextInputProps {
  fontWeight?: FontWeight;
}

const getFontFamily = (fontWeight?: FontWeight): string => {
  switch (fontWeight) {
    case "normal":
      return "Poppins_400Regular";
    case "medium":
      return "Poppins_500Medium";
    case "semi-bold":
      return "Poppins_600SemiBold";
    case "bold":
      return "Poppins_700Bold";
    default:
      return "Poppins_400Regular";
  }
};

const SKTextInput: React.FC<CustomTextProps> = ({
  fontWeight,
  style,
  ...restProps
}) => {
  const font = getFontFamily(fontWeight); // Replace 'YourDefaultFont' with the desired font family

  return (
    <TextInput
      style={[styles.text, { fontFamily: font }, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    // Additional styles for the text component
  },
});

export default SKTextInput;
