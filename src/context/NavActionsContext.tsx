import { useIsFocused } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface NavAction {
  label: string;
  onPress: () => void;
}

export interface PrimaryNavAction extends NavAction {
  icon?: LucideIcon;
  loading?: boolean;
}

export interface NavActions {
  back?: NavAction;
  primary?: PrimaryNavAction;
}

interface Registration {
  owner: string;
  actions: NavActions;
}

interface NavActionsRegistry {
  register: (owner: string, actions: NavActions) => void;
  unregister: (owner: string) => void;
}

const NavActionsStateContext = createContext<NavActions>({});
const NavActionsRegistryContext = createContext<NavActionsRegistry | null>(null);

export function NavActionsProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<Registration | null>(null);

  const register = useCallback((owner: string, actions: NavActions) => {
    setRegistration({ owner, actions });
  }, []);

  // Solo limpia si la pantalla que se va sigue siendo la dueña: evita borrar las acciones de la que llega.
  const unregister = useCallback((owner: string) => {
    setRegistration((current) => (current?.owner === owner ? null : current));
  }, []);

  const registry = useMemo(() => ({ register, unregister }), [register, unregister]);

  return (
    <NavActionsRegistryContext value={registry}>
      <NavActionsStateContext value={registration?.actions ?? {}}>
        {children}
      </NavActionsStateContext>
    </NavActionsRegistryContext>
  );
}

export function useNavActionsState(): NavActions {
  return use(NavActionsStateContext);
}

// Una pantalla publica sus acciones en la isla solo mientras está enfocada.
export function useNavActions(actions: NavActions): void {
  const registry = use(NavActionsRegistryContext);
  if (!registry) {
    throw new Error('useNavActions debe usarse dentro de NavActionsProvider');
  }

  const { register, unregister } = registry;
  const owner = useId();
  const isFocused = useIsFocused();
  const latest = useRef(actions);

  useEffect(() => {
    latest.current = actions;
  });

  // Se re-publica solo cuando cambia lo visible; los handlers se leen siempre de la última versión.
  const signature = [
    actions.back?.label,
    actions.primary?.label,
    actions.primary?.loading ? 'loading' : '',
  ].join('|');

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const { back, primary } = latest.current;
    register(owner, {
      back: back && { label: back.label, onPress: () => latest.current.back?.onPress() },
      primary: primary && { ...primary, onPress: () => latest.current.primary?.onPress() },
    });

    return () => unregister(owner);
  }, [isFocused, signature, owner, register, unregister]);
}
