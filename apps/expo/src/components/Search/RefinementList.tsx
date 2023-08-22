import React, { useEffect, useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  UseRefinementListProps,
  useRefinementList,
} from "react-instantsearch-hooks";

const RefinementList: React.FC<UseRefinementListProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const {
    items,
    hasExhaustiveItems,
    createURL,
    refine,
    sendEvent,
    searchForItems,
    isFromSearch,
    canRefine,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList(props);
  useEffect(() => {
    if (value !== "") {
      handleRefine(value);
    }
  }, [value]);

  const handleRefine = (value: string | null) => {
    console.log(value);
    canRefine && value && refine(value);
  };
  return (
    <View className="z-0  w-32 rounded-br-lg rounded-tr-lg p-0">
      <DropDownPicker
        open={open}
        value={value}
        setValue={setValue}
        placeholder="School"
        placeholderStyle={{
          color: "gray",
        }}
        listMode="MODAL"
        style={{
          borderColor: "#dddddd",
          borderLeftColor: "#f2f2f2",
          borderRadius: 0,
          borderBottomRightRadius: 8,
          borderTopRightRadius: 8,
          padding: 0,
          margin: 0,
          zIndex: 30,
        }}
        textStyle={{
          fontFamily: "Poppins_400Regular",
        }}
        items={items.reverse().map((item) => {
          return {
            label: item.label,
            value: item.value,
          };
        })}
        setOpen={setOpen}
      />
    </View>
  );
};

export default RefinementList;
