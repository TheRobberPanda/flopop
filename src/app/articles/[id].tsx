import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, EmptyState, IconButton, Row } from '@/components/ui';
import { articles, getArticle } from '@/content/articles';
import { useAppStore } from '@/store/useAppStore';
import { spacing, useTheme } from '@/theme';

export default function ArticleScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const article = getArticle(params.id ?? '');
  const saved = useAppStore((state) => state.settings.savedArticles);
  const updateSettings = useAppStore((state) => state.updateSettings);

  if (!article) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="book-open-outline"
          title="Article not found"
          body="It may have been removed."
          action={
            <AppText variant="label" color={colors.primary} onPress={() => router.back()}>
              Go back
            </AppText>
          }
        />
      </SafeAreaView>
    );
  }

  const isSaved = saved.includes(article.id);
  const toggleSave = () => {
    updateSettings({
      savedArticles: isSaved ? saved.filter((id) => id !== article.id) : [...saved, article.id],
    });
  };

  const related = articles.filter((item) => item.category === article.category && item.id !== article.id).slice(0, 2);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <View style={styles.flex} />
        <IconButton
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          color={isSaved ? colors.primary : colors.text}
          onPress={toggleSave}
        />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color={colors.primary}>
          {article.category} · {article.minutes} min read
        </AppText>
        <AppText variant="title">{article.title}</AppText>
        <AppText variant="body" muted>
          {article.summary}
        </AppText>

        {article.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.heading ? <AppText variant="heading">{section.heading}</AppText> : null}
            {section.paragraphs.map((paragraph, pIndex) => (
              <AppText key={pIndex} variant="body" style={styles.paragraph}>
                {paragraph}
              </AppText>
            ))}
          </View>
        ))}

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceAlt }]}>
          <Row gap={spacing.sm}>
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.textSecondary} />
            <AppText variant="caption" muted style={styles.flex}>
              General information only — not medical advice. See a professional about your own health.
            </AppText>
          </Row>
        </View>

        {related.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="heading">More on {article.category.toLowerCase()}</AppText>
            {related.map((item) => (
              <AppText
                key={item.id}
                variant="bodyStrong"
                color={colors.primary}
                onPress={() => router.replace(`/articles/${item.id}` as never)}>
                {item.title}
              </AppText>
            ))}
          </View>
        ) : null}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  section: { gap: spacing.sm },
  paragraph: {},
  disclaimer: { padding: spacing.md, borderRadius: 16 },
});
