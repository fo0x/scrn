import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActionCard } from './src/components/ActionCard';
import { processLatestScreenshots } from './src/services/screenshotPipeline';
import type { SmartAction } from './src/types/domain';

export default function App() {
  const [actions, setActions] = useState<SmartAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return actions.reduce<Record<string, SmartAction[]>>((acc, action) => {
      acc[action.group] ??= [];
      acc[action.group].push(action);
      return acc;
    }, {});
  }, [actions]);

  const scanScreenshots = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextActions = await processLatestScreenshots();
      setActions(nextActions);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Не вдалося обробити скріншоти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>SmartShot</Text>
        <Text style={styles.subtitle}>Перетворюємо скріншоти на корисні дії</Text>
      </View>

      <TouchableOpacity onPress={scanScreenshots} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Сканую...' : 'Проаналізувати скріншоти'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#6C8BFF" style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView contentContainerStyle={styles.results}>
        {Object.entries(grouped).map(([group, groupActions]) => (
          <View key={group} style={styles.groupBlock}>
            <Text style={styles.groupTitle}>{group}</Text>
            {groupActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </View>
        ))}

        {!loading && actions.length === 0 && (
          <Text style={styles.placeholder}>
            Натисни кнопку зверху, щоб знайти нові скріншоти і створити задачі, події, wishlists та інші дії.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F7F8FB'
  },
  subtitle: {
    marginTop: 6,
    color: '#B8BED1',
    fontSize: 14
  },
  button: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#6C8BFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center'
  },
  buttonText: {
    color: '#0A0F28',
    fontWeight: '700'
  },
  loader: {
    marginTop: 24
  },
  error: {
    marginTop: 18,
    marginHorizontal: 20,
    color: '#FF7B9D'
  },
  results: {
    paddingBottom: 60,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18
  },
  groupBlock: {
    gap: 10
  },
  groupTitle: {
    color: '#D8DDF0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12
  },
  placeholder: {
    marginTop: 30,
    color: '#9FA6BC',
    lineHeight: 20
  }
});
