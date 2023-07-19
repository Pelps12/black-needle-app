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

import { trpc } from "../../utils/trpc";
import SKText from "../Utils/SKText";
import SKTextInput from "../Utils/SKTextInput";

// import SKText from "@components/Utils/SKText";
// import SKTextInput from "@components/Utils/SKTextInput";

const AddPricesModal = ({ setCategories, categories, prices }) => {
  const [productName, setProductName] = useState("");
  const [openDropDown, setOpenDropDown] = useState(false);
  const [dropDownValue, setDropDownValue] = useState(null);
  const createPrice = trpc.price.createPrice.useMutation();
  const [openDropDownDuration, setOpenDropDownDuration] = useState(false);
  const [dropDownValueDuration, setDropDownValueDuration] = useState(null);
  const [openDropDownCategories, setOpenDropDownCategories] = useState(false);
  const [dropDownValueCategories, setDropDownValueCategories] = useState(null);
  const [amount, setAmount] = useState("0.00");
  const [items, setItems] = useState([
    { label: "GOOD", value: "GOOD" },
    { label: "SERVICE", value: "SERVICE" },
  ]);
  const [duration, setDuration] = useState([
    { label: "30 min", value: "1800" },
    { label: "1 hr", value: "3600" },
    { label: "1 hr 30 min", value: "5400" },
    { label: "2 hr", value: "7200" },
    { label: "2 hr 30 min", value: "9000" },
    { label: "3 hr", value: "10800" },
    { label: "3 hr 30 min", value: "12600" },
    { label: "4 hr", value: "14400" },
    { label: "4 hr 30 min", value: "16200" },
    { label: "5 hr", value: "18000" },
  ]);
  const [listCategoryNames, setListCategoryNames] = useState([
    { label: "", value: "" },
  ]);
  useState(() => {
    const namesArray = categories.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    setListCategoryNames(namesArray);
  });
  const handleNumberChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, "");
    setAmount(numericText);
  };
  const handleSubmitButton = async () => {
    if (
      productName === "" ||
      dropDownValue === null ||
      dropDownValueCategories === null ||
      amount === "0.00"
    ) {
      console.log(amount);
    } else if (
      productName != "" ||
      dropDownValue != null ||
      dropDownValueCategories != null ||
      amount != "0.00"
    ) {
      let checkIfDuration = false;
      if (dropDownValue === "SERVICE" && dropDownValueDuration != null) {
        checkIfDuration = true;
      } else if (
        dropDownValue === "SERVICE" &&
        dropDownValueDuration === null
      ) {
        checkIfDuration = false;
      } else if (dropDownValue === "GOOD") {
        checkIfDuration = true;
      }
      if (checkIfDuration) {
        const newProductData = [...prices];
        await createPrice.mutateAsync(
          {
            categoryId: dropDownValueCategories,
            amount: parseFloat(amount),
            name: productName,
            type: dropDownValue,
            ...(dropDownValueDuration != null &&
              dropDownValueDuration != undefined &&
              checkIfDuration === true && { duration: dropDownValueDuration }),
          },
          {
            onSuccess: (data) => {
              console.log("Done");
              console.log(data);
              console.log(prices);
              setCategories(...prices, data);
              // setPrice([...price, data.price]);
              // editSetPrice(data.price);
            },
          },
        );
        console.log(newProductData[0].prices);
      }
    }
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

          <View className="z-30">
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
          <View className="z-20">
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
                open={openDropDownDuration}
                value={dropDownValueDuration}
                items={duration}
                setOpen={setOpenDropDownDuration}
                setValue={setDropDownValueDuration}
                setItems={setDuration}
              />
            </View>
          )}
          <View className=" center mb-4 mt-2 flex flex-row items-center justify-center"></View>
          <View className="mx-auto my-2 mb-10 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-3 py-1  shadow-sm">
            <Pressable onPress={handleSubmitButton}>
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
