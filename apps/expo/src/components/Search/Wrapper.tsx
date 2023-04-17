import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch } from "react-instantsearch-hooks";

import { InfiniteHits } from "./InfinteHits";
import Result from "./Result";
import { SearchBox } from "./SearchBox";

const searchClient = algoliasearch(
  "MXKJ7URABT",
  "ecd72cebe5c87facc09e9e9884038e0a",
);

export default function App() {
  return (
    <View className="flex flex-col bg-[#F2F2F2]">
      <InstantSearch searchClient={searchClient} indexName="dev_sakpa">
        <SearchBox />

        <InfiniteHits maxHitsPerPage={5} hitComponent={Result} />
      </InstantSearch>
    </View>
  );
}
