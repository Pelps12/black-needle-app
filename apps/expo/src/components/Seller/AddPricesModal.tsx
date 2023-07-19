import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

import SKText from "../Utils/SKText";
import SKTextInput from "../Utils/SKTextInput";

// import SKText from "@components/Utils/SKText";
// import SKTextInput from "@components/Utils/SKTextInput";

const AddPricesModal = ({ categories }) => {
  const [productName, setProductName] = useState("");
  const [openDropDown, setOpenDropDown] = useState(false);
  const [dropDownValue, setDropDownValue] = useState(null);
  const [openDropDownCategories, setOpenDropDownCategories] = useState(false);
  const [dropDownValueCategories, setDropDownValueCategories] = useState(null);
  const [amount, setAmount] = useState("0.00");
  const [items, setItems] = useState([
    { label: "GOOD", value: "GOOD" },
    { label: "SERVICE", value: "SERVICE" },
  ]);
  const [listCategoryNames, setListCategoryNames] = useState([
    { label: "", value: "" },
  ]);
  useState(() => {
    const namesArray = categories.map((item) => ({
      label: item.name,
      value: item.name,
    }));
    setListCategoryNames(namesArray);
  });
  const handleNumberChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, "");
    setAmount(numericText);
  };

  return (
    <SafeAreaView className="mx-6 my-auto flex h-auto  items-center justify-center rounded-lg bg-[#fafafa]">
      <View className="">
        <View className="px-4">
          <View className=" center mb-4 mt-2 flex flex-row items-center justify-center"></View>
          <View className="pb-4 pt-4">
            <Text className="text-center text-3xl  font-medium">
              Add Product
            </Text>
          </View>
          <View>
            <SKTextInput
              className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-900"
              placeholder="Product Name"
              placeholderTextColor="gray"
              value={productName}
              onChangeText={(text) => setProductName(text)}
            ></SKTextInput>
          </View>
          <View>
            <SKTextInput
              style={{ color: amount != "0.00" ? "#000000" : "#808080" }}
              className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
              value={`$${amount}`}
              placeholder="0.00"
              keyboardType="numeric"
              onChangeText={handleNumberChange}
            ></SKTextInput>
          </View>

          <View className="z-20">
            <DropDownPicker
              containerStyle={{
                marginTop: 4,
                marginBottom: 4,
              }}
              textStyle={{
                fontSize: 18,
                lineHeight: 28,
                color: dropDownValueCategories != null ? "#000000" : "#808080",
              }}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                width: 288,
                height: 64,
                borderColor: " #d9d9d9",
                padding: 16,
              }}
              placeholder="Category"
              open={openDropDownCategories}
              value={dropDownValueCategories}
              items={listCategoryNames}
              setOpen={setOpenDropDownCategories}
              setValue={setDropDownValueCategories}
              setItems={setListCategoryNames}
            />
          </View>
          <View className="z-10">
            <DropDownPicker
              containerStyle={{
                marginTop: 4,
                marginBottom: 4,
              }}
              textStyle={{
                fontSize: 18,
                lineHeight: 28,
                color: setDropDownValue != null ? "#000000" : "#808080",
              }}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                width: 288,
                height: 64,
                borderColor: " #d9d9d9",
                padding: 16,
              }}
              placeholder="Type of Product"
              open={openDropDown}
              value={dropDownValue}
              items={items}
              setOpen={setOpenDropDown}
              setValue={setDropDownValue}
              setItems={setItems}
            />
          </View>
          {dropDownValue && dropDownValue === "SERVICE" && (
            <View className="z-10">
              <DropDownPicker
                containerStyle={{
                  marginTop: 4,
                  marginBottom: 4,
                }}
                textStyle={{
                  fontSize: 18,
                  lineHeight: 28,
                  color: setDropDownValue != null ? "#000000" : "#808080",
                }}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  width: 288,
                  height: 64,
                  borderColor: " #d9d9d9",
                  padding: 16,
                }}
                placeholder="Service Duration"
                open={openDropDown}
                value={dropDownValue}
                items={items}
                setOpen={setOpenDropDown}
                setValue={setDropDownValue}
                setItems={setItems}
              />
            </View>
          )}
          <View className=" center mb-4 mt-2 flex flex-row items-center justify-center"></View>
          <View className="mx-auto my-2 mb-10 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-3 py-1  shadow-sm">
            <Pressable
              onPress={() => {
                console.log(dropDownValue);
              }}
            >
              <SKText className="text-lg font-semibold text-white">
                Add Product
              </SKText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddPricesModal;
