import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, createContext } from 'react';
import meQuery from '../../queries/users/me.graphql';
// import updateCurrentUserQuery from '../../queries/graphql/users/updateUser.graphql';
import { EventRegister } from 'react-native-event-listeners';
import { User } from '../../../types/user';
import { AUTH_CLIENT_ID } from '@env';
import { useLazyQuery } from '@apollo/client';
import { authAxios } from '../../clients/axios';
import { OAuthCredentials } from '../../../types/credentials';

interface RegisterData {
  user: User;
  credentials: OAuthCredentials;
}

interface SignInByEmailParams {
  email: string;
  password: string;
  passwordConfirmation: string;
}

type SignInByEmail = (params: SignInByEmailParams) => Promise<boolean>;

interface SignInByPhoneNumberParams {
  phoneNumber: string;
  otpCode: string;
}

type SignInByPhoneNumber = (params: SignInByPhoneNumberParams) => Promise<boolean>;

interface SignInByAssertionParams {
  assertion: string;
  provider: string;
}

type SignInByAssertion = (params: SignInByAssertionParams) => Promise<boolean>;

interface AuthContextData {
  currentUser: User;
  setCurrentUser: (User) => void;
  isSignedIn: boolean;
  loading: boolean;
  userLoading: boolean;
  register(User): Promise<void>;
  signInByEmail: SignInByEmail;
  signInByPhoneNumber: SignInByPhoneNumber;
  signInByAssertion: SignInByAssertion;
  update(User): Promise<void>;
  logout(): Promise<void>;
  sendOtp(phoneNumber: String, via: String, validationHash?: String): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = EventRegister.addEventListener('unauthenticate', () => {
      setCurrentUser(null);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  const [getCurrentUser, { data: { me } = { me: null }, loading: userLoading, error }] = useLazyQuery<
    { me: User },
    void
  >(meQuery, {
    context: { clientName: 'V2' },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    try {
      AsyncStorage.getItem('credentials').then(credentials => {
        if (credentials) {
          getCurrentUser();
        }
      });
    } catch (err) {
      setCurrentUser(undefined);
    }
  }, []);

  useEffect(() => {
    if (me) {
      setCurrentUser(me);
    }
  }, [me]);

  useEffect(() => {
    setIsSignedIn(Boolean(currentUser));
  }, [currentUser]);

  const sendOtp = async (phoneNumber: String, via: String = 'sms', validationHash?: String) => {
    // await fetch();
  };

  const register = async (user: User) => {
    const registerResult = await authAxios.post<RegisterData>('/users.json', {
      user,
    });

    await AsyncStorage.setItem('credentials', JSON.stringify(registerResult.data.credentials));
    setCurrentUser(registerResult.data.user);
  };

  const signInByEmail: SignInByEmail = async ({ email, password, passwordConfirmation }) => {
    try {
      const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
        grantType: 'password',
        clientId: AUTH_CLIENT_ID,
        email,
        password,
        passwordConfirmation,
      });

      await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
      await getCurrentUser();

      return true;
    } catch (err) {
      return false;
    }
  };

  const signInByPhoneNumber: SignInByPhoneNumber = async ({ phoneNumber, otpCode }) => {
    try {
      const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
        grantType: 'password',
        clientId: AUTH_CLIENT_ID,
        phoneNumber,
        otpCode,
      });

      await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
      await getCurrentUser();

      return true;
    } catch (err) {
      return false;
    }
  };

  const signInByAssertion: SignInByAssertion = async ({ provider, assertion }) => {
    try {
      const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
        grantType: 'assertion',
        clientId: AUTH_CLIENT_ID,
        provider,
        assertion,
      });

      await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
      await getCurrentUser();

      return true;
    } catch (err) {
      return false;
    }
  };

  // Remove data from context, so the App can be notified and send the user to the AuthStack
  const logout = async () => {
    try {
      const token = JSON.parse(await AsyncStorage.getItem('credentials'));
      await authAxios.post('/oauth/revoke', {
        clientId: AUTH_CLIENT_ID,
        token,
      });
    } finally {
      await AsyncStorage.setItem('credentials', null);
      setCurrentUser(null);
    }
  };

  const update = async (userData: User) => {
    // // Remove data from context, so the App can be notified
    // // and send the user to the AuthStack
    // const {
    //   data: { update_users_by_pk: user },
    // } = await updateCurrentUser({
    //   variables: {
    //     id: currentUser.id,
    //     user: userData,
    //   },
    // });
    // setCurrentUser(user);
  };

  return (
    // This component will be used to encapsulate the whole App,
    // so all components will have access to the Context
    <AuthContext.Provider
      value={{
        isSignedIn,
        currentUser,
        setCurrentUser,
        userLoading,
        loading,
        register,
        sendOtp,
        signInByEmail,
        signInByPhoneNumber,
        signInByAssertion,
        logout,
        update,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;