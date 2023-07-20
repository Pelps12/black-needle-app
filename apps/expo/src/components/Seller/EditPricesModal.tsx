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

const EditPricesModal = ({
  closeModal,
  setCategories,
  getCat,
  categories,
  price,
}) => {
  const [editProductName, setEditProductName] = useState(price.name);
  const [editAmount, setEditAmount] = useState(price.amount);
  const searchResult = categories.filter((item) =>
    item.id.includes(price.categoryId),
  );
  console.log();

  const [editCategoriesDropDownValue, setEditCategoriesDropDownValue] =
    useState(searchResult[0].name);

  const [openDropDownCategories, setOpenDropDownCategories] = useState(false);
  const [openDropDownDuration, setOpenDropDownDuration] = useState(false);
  const [dropDownValueDuration, setDropDownValueDuration] = useState(
    price.duration,
  );
  const updatePrice = trpc.price.updatePrice.useMutation();
  const [openDropDown, setOpenDropDown] = useState(false);
  const [dropDownValue, setDropDownValue] = useState(price.type);
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
  const handleEditSubmitButton = async () => {
    if (
      editProductName === "" ||
      dropDownValue === null ||
      editCategoriesDropDownValue === null ||
      editAmount === "0.00"
    ) {
      console.log(editAmount);
    } else if (
      editProductName != "" ||
      dropDownValue != null ||
      editCategoriesDropDownValue != null ||
      editAmount != "0.00"
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
        console.log("In");
        await updatePrice.mutateAsync(
          {
            priceId: price.id,
            amount: parseFloat(editAmount),
            name: editProductName,
            type: dropDownValue,
            ...(dropDownValueDuration != null &&
              dropDownValueDuration != undefined &&
              checkIfDuration === true && {
                duration: parseInt(dropDownValueDuration),
              }),
          },
          {
            onSuccess: async () => {
              console.log("Done");
              const { data, isSuccess } = await getCat.refetch();
              if (isSuccess) {
                setCategories(data?.user?.seller?.Category);
                closeModal();
                console.log("in");
              }

              // setPrice([...price, data.price]);
              // editSetPrice(data.price);
            },
          },
        );
      }
    }
  };
  const handleNumberChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, "");
    setEditAmount(numericText);
  };
  return (
    <SafeAreaView className="mx-6 my-auto flex h-auto  items-center justify-center rounded-lg bg-[#fafafa]">
      <View className="">
        <View className="px-4">
          <View className=" center mb-4 mt-2 flex flex-row items-center justify-center"></View>
          <View className="pb-4 pt-4">
            <Text className="text-center text-3xl  font-medium">
              Edit Product
            </Text>
          </View>
          <View>
            <SKTextInput
              className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-900"
              placeholder="Product Name"
              placeholderTextColor="gray"
              value={editProductName}
              onChangeText={(text) => setEditProductName(text)}
            ></SKTextInput>
          </View>
          <View>
            <SKTextInput
              style={{ color: editAmount != "0.00" ? "#000000" : "#808080" }}
              className=" my-1 block  h-16 w-72 rounded-xl border-2 border-[#d9d9d9] bg-gray-100 p-4 text-lg outline-none focus:text-gray-700"
              value={`$${editAmount}`}
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
                color:
                  editCategoriesDropDownValue != null ? "#000000" : "#808080",
              }}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                width: 288,
                height: 64,
                borderColor: " #d9d9d9",
                padding: 16,
              }}
              placeholder={searchResult[0].name}
              open={openDropDownCategories}
              value={editCategoriesDropDownValue}
              items={listCategoryNames}
              setOpen={setOpenDropDownCategories}
              setValue={setEditCategoriesDropDownValue}
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
              placeholder={price.type}
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
                placeholder={price.duration}
                open={openDropDownDuration}
                value={dropDownValueDuration}
                items={duration}
                setOpen={setOpenDropDownDuration}
                setValue={setDropDownValueDuration}
                setItems={setDuration}
              />
            </View>
          )}
        </View>
        <View className=" center mb-4 mt-2 flex flex-row items-center justify-center"></View>
        <View className=" -z-10 mx-auto my-2 mb-10 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-3 py-1  shadow-sm">
          <Pressable onPress={handleEditSubmitButton}>
            <SKText className="text-lg font-semibold text-white">
              Save Changes
            </SKText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditPricesModal;
