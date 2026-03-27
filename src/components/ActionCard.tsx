import { StyleSheet, Text, View } from 'react-native';
import type { SmartAction } from '../types/domain';

interface ActionCardProps {
  action: SmartAction;
}

export function ActionCard({ action }: ActionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.description}>{action.description}</Text>
      <Text style={styles.label}>{action.actionType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1F2D',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3147',
    gap: 6
  },
  title: {
    color: '#F7F8FB',
    fontWeight: '700',
    fontSize: 16
  },
  description: {
    color: '#B8BED1',
    fontSize: 13,
    lineHeight: 19
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#29324F',
    borderRadius: 8,
    color: '#C9D4FF',
    fontSize: 11,
    fontWeight: '600'
  }
});
