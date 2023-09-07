import React from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  UseRefinementListProps,
  UseSearchBoxProps,
  useClearRefinements,
  useRefinementList,
} from "react-instantsearch-hooks";

import SKText from "../../components/Utils/SKText";

const Services: React.FC<
  UseRefinementListProps & UseSearchBoxProps & { text?: string }
> = (props) => {
  const { items, refine, canRefine } = useRefinementList(props);
  const { refine: clear } = useClearRefinements({
    includedAttributes: ["service"],
  });
  const [selectedService, setSelectedService] = React.useState<string>();

  const toggleCase = React.useCallback(
    (str: string) => {
      return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    },
    [items],
  );

  const handleRefine = (value: string | null) => {
    console.log(value);
    if (canRefine && value) {
      clear();
      refine(value);
      setSelectedService(value);
    }
  };
  return (
    <View className="mx-auto flex justify-center gap-3 ">
      <FlatList
        data={items}
        horizontal={true}
        keyExtractor={(item, idx) => idx.toString()}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        className="mx-auto px-2"
        renderItem={({ item }) => (
          <Pressable
            className={` rounded-xl bg-white px-2 py-3 ${
              selectedService === item.value ? "border border-[#72a2f9]" : ""
            }`}
            onPress={(e) => handleRefine(item.value)}
          >
            <SKText>{toggleCase(item.label)}</SKText>
          </Pressable>
        )}
      />
    </View>
  );
};

export default Services;
