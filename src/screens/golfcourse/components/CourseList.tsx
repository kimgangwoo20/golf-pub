import React from 'react';
import { FlatList, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface Course {
  id: string;
  name: string;
  region: string;
  price: string;
  rating: number;
}

interface Props {
  courses: Course[];
  loading: boolean;
  onCoursePress: (id: string) => void;
}

export const CourseList: React.FC<Props> = ({ courses, loading, onCoursePress }) => (
  <FlatList
    data={courses}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => onCoursePress(item.id)}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.region}>{item.region}</Text>
        <View style={styles.footer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    )}
    ListEmptyComponent={
      loading ? (
        <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>골프장이 없습니다</Text>
        </View>
      )
    }
  />
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  region: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  rating: { fontSize: 14, color: '#f59e0b' },
  price: { fontSize: 14, fontWeight: '600', color: '#10b981' },
  loader: { marginTop: 50 },
  empty: { padding: 50, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#94a3b8' },
});
