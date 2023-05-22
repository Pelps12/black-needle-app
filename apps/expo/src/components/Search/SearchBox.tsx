import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useSearchBox } from "react-instantsearch-hooks";

export function SearchBox(props: any) {
  const { query, refine } = useSearchBox(props);
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<TextInput>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);
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
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        className="rounded-md"
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
