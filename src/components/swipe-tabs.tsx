/**
 * Swipeable bottom tabs.
 *
 * React Navigation's bottom tabs cannot be swiped, so the tab bar is built on a
 * material top-tab navigator pinned to the bottom. That gives horizontal swipe
 * gestures between screens while still looking like a normal bottom tab bar.
 */

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

export const SwipeTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);
