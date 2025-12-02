// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Control de inactividad
  const inactivityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const markActivity = () => {
    lastActivityRef.current = Date.now();
  };

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const startInactivityTimer = () => {
    clearInactivityTimer();

    // Comprobamos cada 30 segundos si se pasaron los 5 minutos
    inactivityTimerRef.current = setInterval(async () => {
      const diff = Date.now() - lastActivityRef.current;
      if (diff >= 5 * 60 * 1000) {
        console.log('Sesión cerrada por inactividad');
        clearInactivityTimer();
        await signOut();
      }
    }, 30 * 1000);
  };

  async function loadUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando perfil:', error);
        setAuthError('No se pudo cargar el perfil del usuario');
        setProfile(null);
        return;
      }

      if (!data) {
        console.warn('Perfil no encontrado para usuario:', userId);
        setAuthError(
          'Tu perfil está incompleto. Por favor, completa tu registro.'
        );
        setProfile(null);
        // Si quieres que fuerce cierre de sesión si no hay perfil:
        await signOut();
        return;
      }

      setProfile(data);
      setAuthError(null);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setAuthError('Error al cargar el perfil');
      setProfile(null);
    }
    // OJO: aquí NO tocamos setLoading,
    // eso lo controlan las funciones que llaman a loadUserProfile
  }

  async function signUp(email, password, userData) {
    try {
      setAuthError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('usuarios').insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            nombre: userData.nombre,
            telefono: userData.telefono,
            tipo_usuario: userData.tipo_usuario || 'cliente',
            municipio_id: userData.municipio_id,
          },
        ]);

        if (profileError) throw profileError;

        // Crear wallet si es repartidor
        if (userData.tipo_usuario === 'repartidor') {
          await supabase.from('wallets').insert([
            {
              usuario_id: authData.user.id,
            },
          ]);
        }
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Error en signUp:', error);
      setAuthError(error.message);
      return { data: null, error };
    }
  }

  async function signIn(email, password) {
    try {
      setAuthError(null);
      setLoading(true);
      markActivity();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // onAuthStateChange se encargará de terminar el flujo (perfil + loading)
      return { data, error: null };
    } catch (error) {
      console.error('Error en signIn:', error);
      setAuthError(error.message);
      setLoading(false);
      return { data: null, error };
    }
  }

  async function signOut() {
    try {
      setAuthError(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      setAuthError(error.message);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
      clearInactivityTimer();
    }
  }

  useEffect(() => {
    let mounted = true;

    // Eventos de actividad del usuario
    const activityEvents = ['click', 'keydown', 'mousemove', 'touchstart'];
    const activityHandler = () => {
      markActivity();
    };
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, activityHandler)
    );

    // Intentar cerrar sesión al cerrar la pestaña (no siempre se garantiza, pero ayuda)
    const handleBeforeUnload = () => {
      // No esperamos a que termine, el navegador puede cortar la petición
      supabase.auth.signOut();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          startInactivityTimer();
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        if (mounted) {
          setAuthError(error.message);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setAuthError(null);
        await loadUserProfile(session.user.id);
        markActivity();
        startInactivityTimer();
      } else {
        // SIGNED_OUT u otros eventos sin usuario
        setUser(null);
        setProfile(null);
        setAuthError(null);
        clearInactivityTimer();
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, activityHandler)
      );
      clearInactivityTimer();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
