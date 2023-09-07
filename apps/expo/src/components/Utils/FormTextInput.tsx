import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { ProfileFormSchemaType } from "app/home/profile";
import { Control, FieldValues, useController } from "react-hook-form";

type FontWeight = "normal" | "medium" | "semi-bold" | "bold";

interface CustomTextProps extends TextInputProps {
  fontWeight?: FontWeight;
  control?: Control<ProfileFormSchemaType, any>;
  name: keyof ProfileFormSchemaType;
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

const FormTextInput: React.FC<CustomTextProps> = ({
  fontWeight,
  style,
  control,
  defaultValue,
  value,
  name,
  ...restProps
}) => {
  const { field } = useController({
    control,
    defaultValue: defaultValue,
    name,
  });
  const font = getFontFamily(fontWeight); // Replace 'YourDefaultFont' with the desired font family

  return (
    <TextInput
      value={value ?? field.value}
      onChangeText={field.onChange}
      defaultValue={defaultValue}
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

export default FormTextInput;
