// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        if (mounted) {
          setAuthError(error.message);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setAuthError(null);
        try {
          await loadUserProfile(session.user.id);
        } catch (loadProfileError) {
          console.error(
            'Error al cargar perfil en onAuthStateChange:',
            loadProfileError
          );
          setAuthError(
            loadProfileError.message ||
              'Error al cargar el perfil del usuario.'
          );
          setProfile(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setAuthError(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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
        // si decides forzar logout cuando no hay perfil
        await signOut();
        return;
      }

      setProfile(data);
      setAuthError(null);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setAuthError('Error al cargar el perfil');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password, userData) {
    try {
      setAuthError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tipo_usuario: userData.tipo_usuario,
            nombre: userData.nombre,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert([
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
      }

      // IMPORTANTE: ya NO creamos wallet aquí.
      // La wallet queda a cargo de triggers en BD o lógica específica.

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      setAuthError(error.message);
    }
  }

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
