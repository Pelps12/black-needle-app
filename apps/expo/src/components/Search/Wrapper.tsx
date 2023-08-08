import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { FontAwesome } from "@expo/vector-icons";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, useRefinementList } from "react-instantsearch-hooks";

import Config from "../../utils/config";
import { FacetDropdown } from "./FacetDropDown";
import { InfiniteHits } from "./InfinteHits";
import RefinementList from "./RefinementList";
import Result from "./Result";
import { SearchBox } from "./SearchBox";

const searchClient = algoliasearch(
  "MXKJ7URABT",
  "ecd72cebe5c87facc09e9e9884038e0a",
);

export default function App() {
  return (
    <View className="flex flex-col bg-[#F2F2F2]">
      <InstantSearch
        searchClient={searchClient}
        indexName={Config?.ALGOLIA_INDEX as string}
      >
        <View className="flex flex-row items-center gap-0">
          <SearchBox />

          <RefinementList attribute="school" />
        </View>

        <InfiniteHits maxHitsPerPage={5} hitComponent={Result} />
      </InstantSearch>
    </View>
  );
}
