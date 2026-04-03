import {createRef} from 'react';
import type {NavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from '../types';

export const navigationRef =
  createRef<NavigationContainerRef<RootStackParamList>>();
