import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { UseSearchBoxProps, useSearchBox } from "react-instantsearch-hooks";

import SKTextInput from "../../components/Utils/SKTextInput";

export function SearchBox(props: UseSearchBoxProps) {
  const { query, refine } = useSearchBox(props);
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<TextInput>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);
    console.log(newQuery);
    refine(newQuery);
  }

  // Track when the InstantSearch query changes to synchronize it with
  // the React state.
  // We bypass the state update if the input is focused to avoid concurrent
  // updates when typing.
  if (query !== inputValue && !inputRef.current?.isFocused()) {
    setInputValue(query);
  }

  return (
    <View className="basis-2/3 bg-[#f2f2f2] py-6 pl-2 pr-0">
      <SKTextInput
        ref={inputRef}
        style={styles.input}
        className="w-[3/4] rounded-bl-lg rounded-tl-lg"
        value={inputValue}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
        placeholder="Search for services..."
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F2",
    padding: 18,
  },
  input: {
    height: 48,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
