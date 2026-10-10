import * as Haptics from 'expo-haptics';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { colors, fonts, motion, radii, spacing, typography } from '@/constants/theme';
import { useDepartments } from '@/context/DepartmentsContext';
import type { Department } from '@/types/Entity';
import { DEPARTMENT_LIMITS } from '@/utils/validation';

import { FieldError } from './CustomInput';
import { IconButton } from './IconButton';

const rowEntering = FadeIn.duration(motion.crossfade);
const rowExiting = FadeOut.duration(motion.crossfade);
const rowLayout = LinearTransition.duration(motion.crossfade);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Intenta de nuevo.';
}

interface DepartmentRowProps {
  department: Department;
  isEditing: boolean;
  isLast: boolean;
  onStartEdit: () => void;
  onFinishEdit: () => void;
}

function DepartmentRow({
  department,
  isEditing,
  isLast,
  onStartEdit,
  onFinishEdit,
}: DepartmentRowProps) {
  const { renameDepartment, removeDepartment } = useDepartments();
  const [draft, setDraft] = useState(department.name);
  const [error, setError] = useState<string | undefined>();

  // Al enviar con el teclado se usa el texto del evento: el estado puede no haberse actualizado aún.
  const handleSave = async (value: string = draft) => {
    if (value.trim() === department.name) {
      onFinishEdit();
      return;
    }
    try {
      await renameDepartment(department.id, value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFinishEdit();
    } catch (saveError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(errorMessage(saveError));
    }
  };

  const handleCancel = () => {
    setDraft(department.name);
    setError(undefined);
    onFinishEdit();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar departamento', `¿Eliminar "${department.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeDepartment(department);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (deleteError) {
            // Bloqueo por regla de negocio (departamento en uso): se explica y la fila no se mueve.
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('No se puede eliminar', errorMessage(deleteError));
          }
        },
      },
    ]);
  };

  return (
    <Animated.View
      entering={rowEntering}
      exiting={rowExiting}
      layout={rowLayout}
      style={[styles.row, !isLast && styles.rowDivider]}>
      {isEditing ? (
        <View style={styles.editBlock}>
          <View style={styles.rowContent}>
            <TextInput
              value={draft}
              onChangeText={(value) => {
                setDraft(value);
                setError(undefined);
              }}
              onSubmitEditing={(event) => handleSave(event.nativeEvent.text)}
              autoFocus
              maxLength={DEPARTMENT_LIMITS.nameMax}
              returnKeyType="done"
              selectionColor={colors.purple}
              accessibilityLabel={`Nuevo nombre para ${department.name}`}
              style={[styles.input, error !== undefined && styles.inputError]}
            />
            <IconButton
              icon={Check}
              size="sm"
              tone="dark"
              accessibilityLabel="Guardar nombre"
              onPress={() => handleSave()}
            />
            <IconButton
              icon={X}
              size="sm"
              tone="muted"
              accessibilityLabel="Cancelar edición"
              onPress={handleCancel}
            />
          </View>
          {error && <FieldError message={error} />}
        </View>
      ) : (
        <View style={styles.rowContent}>
          <Text style={styles.name} numberOfLines={1}>
            {department.name}
          </Text>
          <IconButton
            icon={Pencil}
            size="sm"
            tone="muted"
            accessibilityLabel={`Renombrar ${department.name}`}
            onPress={onStartEdit}
          />
          <IconButton
            icon={Trash2}
            size="sm"
            tone="muted"
            iconColor={colors.red}
            accessibilityLabel={`Eliminar ${department.name}`}
            onPress={handleDelete}
          />
        </View>
      )}
    </Animated.View>
  );
}

// Departamentos editables guardados solo en SQLite; las reglas viven en DepartmentsContext.
export function DepartmentList() {
  const { departments, addDepartment } = useDepartments();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | undefined>();

  const handleAdd = async (value: string = newName) => {
    try {
      await addDepartment(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewName('');
      setAddError(undefined);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAddError(errorMessage(error));
    }
  };

  return (
    <View style={styles.card}>
      {departments.length === 0 && (
        <Text style={styles.empty}>No hay departamentos. Agrega el primero abajo.</Text>
      )}

      {departments.map((department, index) => (
        <DepartmentRow
          key={department.id}
          department={department}
          isEditing={editingId === department.id}
          isLast={index === departments.length - 1}
          onStartEdit={() => setEditingId(department.id)}
          onFinishEdit={() => setEditingId(null)}
        />
      ))}

      <Animated.View layout={rowLayout} style={styles.addBlock}>
        <View style={styles.rowContent}>
          <TextInput
            value={newName}
            onChangeText={(value) => {
              setNewName(value);
              setAddError(undefined);
            }}
            onSubmitEditing={(event) => handleAdd(event.nativeEvent.text)}
            placeholder="Nuevo departamento"
            placeholderTextColor={colors.textSecondary}
            maxLength={DEPARTMENT_LIMITS.nameMax}
            returnKeyType="done"
            autoCapitalize="words"
            selectionColor={colors.purple}
            accessibilityLabel="Nombre del nuevo departamento"
            style={[styles.input, addError !== undefined && styles.inputError]}
          />
          <IconButton
            icon={Plus}
            size="sm"
            tone="dark"
            accessibilityLabel="Agregar departamento"
            onPress={() => handleAdd()}
          />
        </View>
        {addError && <FieldError message={addError} />}
      </Animated.View>
    </View>
  );
}

const INPUT_HEIGHT = 44;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  row: {
    paddingVertical: spacing.xs,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editBlock: {
    gap: spacing.xxs,
  },
  name: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    marginLeft: spacing.xxs,
  },
  input: {
    flex: 1,
    height: INPUT_HEIGHT,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.red,
  },
  addBlock: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xxs,
  },
  empty: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
});
