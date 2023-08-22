// @ts-nocheck
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useInfiniteHits } from "react-instantsearch-hooks";

export function InfiniteHits({ hitComponent: Hit, ...props }) {
  const { hits, isLastPage, showMore } = useInfiniteHits(props);

  return (
    <FlatList
      data={hits.filter((result) => result.prices.length !== 0)}
      keyExtractor={(item, idx) => idx.toString()}
      contentContainerStyle={{ paddingBottom: 150 }}
      ListFooterComponent={<View style={{ height: 110 }} />}
      renderItem={({ item }) => (
        <View style={styles.item} className="p-3">
          <Hit result={item} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  separator: {},
  item: {
    padding: 18,
  },
});
