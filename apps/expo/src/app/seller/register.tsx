import React, { useState } from "react";
import { Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { MaterialIcons } from "@expo/vector-icons";

const SellerRegisterPage = () => {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>(null);
  const [items2, setItems2] = useState([
    { label: "UT Dallas", value: "UT Dallas" },
    { label: "UT Arlington", value: "UT Arlington" },
  ]);
  const items = [
    {
      name: "Nails",
      id: 0,
    },
    {
      name: "Catering",
      id: 1,
    },
    {
      name: "Hairdressing",
      id: 2,
    },
  ];
  return (
    <>
      <View>
        <Text className="px-3 text-3xl">Services</Text>
        <View className="px-3">
          <SectionedMultiSelect
            IconRenderer={MaterialIcons}
            items={items}
            uniqueKey="id"
            selectedItems={selectedItems}
            onSelectedItemsChange={(selectedItems) => {
              console.log(selectedItems);
              setSelectedItems(selectedItems);
            }}
            showCancelButton={true}
            onConfirm={() => console.log(selectedItems)}
          />
        </View>
      </View>

      <View className="py-7">
        <Text className="px-3 text-3xl">School</Text>
        <View className="w-64 px-3 ">
          <DropDownPicker
            open={open}
            value={value}
            items={items2}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems2}
            placeholder="Select a School"
          />
        </View>
      </View>
    </>
  );
};

export default SellerRegisterPage;
