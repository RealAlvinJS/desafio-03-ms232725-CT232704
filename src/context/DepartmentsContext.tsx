import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  deleteDepartment,
  insertDepartment,
  isDepartmentNameTaken,
  listDepartments,
  renameDepartment as renameDepartmentRow,
} from '@/db/departmentRepository';
import { countTicketsInDepartment } from '@/db/ticketCacheRepository';
import type { Department } from '@/types/Entity';
import { validateDepartmentName } from '@/utils/validation';

interface DepartmentsContextValue {
  departments: Department[];
  isLoading: boolean;
  addDepartment: (name: string) => Promise<void>;
  renameDepartment: (id: number, name: string) => Promise<void>;
  removeDepartment: (department: Department) => Promise<void>;
}

const DepartmentsContext = createContext<DepartmentsContextValue | null>(null);

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setDepartments(await listDepartments(db));
  }, [db]);

  useEffect(() => {
    let isActive = true;

    listDepartments(db)
      .then((rows) => {
        if (isActive) {
          setDepartments(rows);
        }
      })
      .catch((error: unknown) => console.warn('No se pudieron leer los departamentos.', error))
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [db]);

  // Valida formato y unicidad antes de tocar SQLite para devolver mensajes claros.
  const assertValidName = useCallback(
    async (name: string, excludeId?: number) => {
      const formatError = validateDepartmentName(name);
      if (formatError) {
        throw new Error(formatError);
      }
      if (await isDepartmentNameTaken(db, name, excludeId)) {
        throw new Error(`Ya existe un departamento llamado "${name.trim()}".`);
      }
    },
    [db],
  );

  const addDepartment = useCallback(
    async (name: string) => {
      await assertValidName(name);
      await insertDepartment(db, name);
      await reload();
    },
    [db, assertValidName, reload],
  );

  // Renombrar solo afecta a tickets nuevos: los existentes guardan el nombre con el que se crearon.
  const renameDepartment = useCallback(
    async (id: number, name: string) => {
      await assertValidName(name, id);
      await renameDepartmentRow(db, id, name);
      await reload();
    },
    [db, assertValidName, reload],
  );

  // No se elimina un departamento que algún ticket conocido todavía referencia.
  const removeDepartment = useCallback(
    async (department: Department) => {
      const inUse = await countTicketsInDepartment(db, department.name);
      if (inUse > 0) {
        throw new Error(
          `"${department.name}" tiene ${inUse} ticket${inUse === 1 ? '' : 's'} asociado${inUse === 1 ? '' : 's'} y no se puede eliminar.`,
        );
      }
      await deleteDepartment(db, department.id);
      await reload();
    },
    [db, reload],
  );

  const value = useMemo(
    () => ({ departments, isLoading, addDepartment, renameDepartment, removeDepartment }),
    [departments, isLoading, addDepartment, renameDepartment, removeDepartment],
  );

  return <DepartmentsContext value={value}>{children}</DepartmentsContext>;
}

export function useDepartments(): DepartmentsContextValue {
  const context = use(DepartmentsContext);
  if (!context) {
    throw new Error('useDepartments debe usarse dentro de DepartmentsProvider');
  }
  return context;
}
