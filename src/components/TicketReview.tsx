import { ImageOff, PencilLine } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { INITIAL_STATUS, PRIORITY_META } from '@/constants/tickets';
import { colors, radii, sizes, spacing, typography } from '@/constants/theme';
import type { TicketForm } from '@/utils/validation';

import { Badge } from './Badge';
import { EvidenceImage } from './EvidenceImage';

interface TicketReviewProps {
  form: TicketForm;
  onEditStep: (step: number) => void;
}

interface SectionProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: ReactNode;
}

const THUMBNAIL_HEIGHT = 140;
const DOT_SIZE = 8;

function Section({ title, step, onEdit, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable
          onPress={() => onEdit(step)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${title.toLowerCase()}`}
          style={styles.edit}>
          <PencilLine color={colors.purple} size={sizes.iconSmall} strokeWidth={sizes.iconStroke} />
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

// Último paso: el usuario confirma todo de un vistazo y puede volver al paso exacto que quiera corregir.
export function TicketReview({ form, onEditStep }: TicketReviewProps) {
  const priority = form.priority ? PRIORITY_META[form.priority] : null;
  const imageUrl = form.imageUrl.trim();

  return (
    <View style={styles.card}>
      <Section title="Problema" step={0} onEdit={onEditStep}>
        <Text style={styles.title}>{form.title.trim()}</Text>
        <Text style={styles.body}>{form.description.trim()}</Text>
      </Section>

      <View style={styles.divider} />

      <Section title="Clasificación" step={1} onEdit={onEditStep}>
        <View style={styles.row}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{form.category}</Text>
          </View>
          {priority && (
            <View style={styles.tag}>
              <View style={[styles.dot, { backgroundColor: priority.color }]} />
              <Text style={styles.tagText}>Prioridad {priority.label.toLowerCase()}</Text>
            </View>
          )}
        </View>
      </Section>

      <View style={styles.divider} />

      <Section title="Asignación" step={2} onEdit={onEditStep}>
        <Text style={styles.body}>{form.assignee.trim()}</Text>
        {imageUrl ? (
          <EvidenceImage uri={imageUrl} height={THUMBNAIL_HEIGHT} />
        ) : (
          <View style={styles.noImage}>
            <ImageOff
              color={colors.textSecondary}
              size={sizes.iconSmall}
              strokeWidth={sizes.iconStroke}
            />
            <Text style={styles.caption}>Sin evidencia adjunta</Text>
          </View>
        )}
      </Section>

      <View style={styles.footer}>
        <Text style={styles.caption}>Se registrará como</Text>
        <Badge status={INITIAL_STATUS} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  editText: {
    ...typography.caption,
    color: colors.purple,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  tagText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
  },
  noImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
