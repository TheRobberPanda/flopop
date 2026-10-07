import { StyleSheet, View } from 'react-native';

export default function LogTabPlaceholder() {
  return <View style={styles.empty} />;
}

const styles = StyleSheet.create({
  empty: { flex: 1 },
});
