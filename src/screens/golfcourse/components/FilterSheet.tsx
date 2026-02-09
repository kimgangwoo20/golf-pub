import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  filters: any;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const FilterSheet: React.FC<Props> = ({ visible, filters, onClose, onApply }) => {
  const [tempFilters, setTempFilters] = React.useState(filters);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.title}>필터</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>지역</Text>
          <View style={styles.optionRow}>
            {['전체', '서울', '경기', '제주'].map((region) => (
              <TouchableOpacity
                key={region}
                style={[styles.option, tempFilters.region === region && styles.optionActive]}
                onPress={() => setTempFilters({ ...tempFilters, region })}
              >
                <Text style={styles.optionText}>{region}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>가격대</Text>
          <View style={styles.optionRow}>
            {['전체', '10만원 이하', '10-20만원', '20만원 이상'].map((price) => (
              <TouchableOpacity
                key={price}
                style={[styles.option, tempFilters.price === price && styles.optionActive]}
                onPress={() => setTempFilters({ ...tempFilters, price })}
              >
                <Text style={styles.optionText}>{price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={() => onApply(tempFilters)}>
            <Text style={styles.applyText}>적용하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  close: { fontSize: 24, color: '#94a3b8' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  optionActive: { backgroundColor: '#10b981' },
  optionText: { fontSize: 14, color: '#64748b' },
  applyButton: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 12, marginTop: 20 },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
