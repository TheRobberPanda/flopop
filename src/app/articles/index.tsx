import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Card, Chip, IconButton, Row } from '@/components/ui';
import { articleCategories, articles } from '@/content/articles';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

export default function ArticlesScreen() {
  const { colors } = useTheme();
  const saved = useAppStore((state) => state.settings.savedArticles);
  const [category, setCategory] = useState('All');

  const filtered = category === 'All' ? articles : articles.filter((article) => article.category === category);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Health library
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="body" muted>
          Short, plain-language reads. Everything is stored on your phone and works offline.
        </AppText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {articleCategories.map((item) => (
            <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} compact />
          ))}
        </ScrollView>

        {filtered.map((article) => (
          <Card key={article.id} onPress={() => router.push(`/articles/${article.id}` as Href)}>
            <Row gap={spacing.md}>
              <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <AppText variant="caption" muted>
                    {article.category}
                  </AppText>
                  {saved.includes(article.id) ? (
                    <MaterialCommunityIcons name="bookmark" size={16} color={colors.primary} />
                  ) : null}
                </Row>
                <AppText variant="bodyStrong">{article.title}</AppText>
                <AppText variant="caption" muted numberOfLines={2}>
                  {article.summary}
                </AppText>
                <AppText variant="tiny" muted style={{ marginTop: 4 }}>
                  {article.minutes} min read
                </AppText>
              </View>
            </Row>
          </Card>
        ))}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  categories: { gap: spacing.sm, paddingVertical: spacing.xs },
  icon: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
