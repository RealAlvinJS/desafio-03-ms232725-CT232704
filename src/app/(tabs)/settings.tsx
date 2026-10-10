import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { colors, typography } from '@/constants/theme';
import { listDepartments } from '@/db/departmentRepository';
import type { Department } from '@/types/Entity';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [departments, setDepartments] = useState<Department[] | null>(null);

  useEffect(() => {
    listDepartments(db).then(setDepartments);
  }, [db]);

  return (
    <ScreenPlaceholder title="Ajustes" milestone="H7">
      {departments === null ? (
        <LoadingSpinner label="Leyendo SQLite…" />
      ) : (
        <Text style={styles.text}>
          SQLite · {departments.length} departamentos: {departments.map((d) => d.name).join(', ')}
        </Text>
      )}
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
