import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  UseRefinementListProps,
  useRefinementList,
} from "react-instantsearch-hooks";
import DropDownPicker from "react-native-dropdown-picker";

const RefinementList: React.FC<UseRefinementListProps> = (props) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>("")
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
    if(value !== ""){
        handleRefine(value)
    }
  }, [value]);

  const handleRefine = (value: string | null) => {
    console.log(value)
    canRefine&& value && refine(value)
  }
    return (
    <View className="w-32  rounded-tr-lg rounded-br-lg p-0 z-0">
        <DropDownPicker
            open={open}
            value={value}
            setValue={setValue}
            placeholder="School"
            placeholderStyle={{
                color: "gray"
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
                zIndex: 30
            }}
            items={items.reverse().map((item) => {
            return {
                label: item.label,
                value: item.value,
            };
            })}
            setOpen={setOpen}
            
        />
    </View>)
};

export default RefinementList;
