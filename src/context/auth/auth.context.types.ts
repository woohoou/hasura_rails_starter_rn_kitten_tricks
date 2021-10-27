import { User } from '../../../types/user';
import { OAuthCredentials } from '../../../types/credentials';
import { AuthorizeResult } from 'react-native-app-auth';

export interface UserSignUpByEmail {
  email: string;
  name: string;
  username: string;
  password: string;
  passwordConfirmation: string;
}

export interface SignUpByEmailErrors {
  email?: string[];
  name?: string[];
  username?: string[];
  password?: string[];
  passwordConfirmation?: string[];
}

export interface SignUpData {
  user?: User;
  credentials?: OAuthCredentials;
  errors?: SignUpByEmailErrors;
}

export type SignUpByEmail = (user: UserSignUpByEmail) => Promise<void>;

export interface UserSignUpByPhoneNumber {
  phoneNumber: string;
}

export type SignUpByPhoneNumber = (user: UserSignUpByPhoneNumber) => Promise<void>;

export interface UserSignInByEmail {
  email: string;
  password: string;
}

export type SignInByEmail = (params: UserSignInByEmail) => Promise<void>;

export interface UserForgotPassword {
  email: string;
}

export interface ForgotPasswordData {
  user?: UserForgotPassword;
}

export type ForgotPassword = (user: UserForgotPassword) => Promise<void>;

export interface SignInByPhoneNumberParams {
  phoneNumber: string;
  otpCode: string;
}

export type SignInByPhoneNumber = (params: SignInByPhoneNumberParams) => Promise<void>;

export interface SignInByAssertionParams {
  assertion: string;
  provider: string;
}

export type SignInByAssertion = (params: SignInByAssertionParams) => Promise<void>;

export type SignInByOAuth2 = (authState: AuthorizeResult) => Promise<void>;

export type SignOut = () => Promise<void>;

export interface AuthContextData {
  currentUser: User;
  setCurrentUser: (User) => void;
  isSignedIn: boolean;
  userLoading: boolean;
  signUpByEmail: SignUpByEmail;
  signUpByPhoneNumber: SignUpByPhoneNumber;
  signInByEmail: SignInByEmail;
  forgotPassword: ForgotPassword;
  signInByPhoneNumber: SignInByPhoneNumber;
  signInByAssertion: SignInByAssertion;
  signInByOAuth2: SignInByOAuth2;
  update(User): Promise<void>;
  signOut: SignOut;
  sendOtp(phoneNumber: String, via: String, validationHash?: String): Promise<void>;
}
