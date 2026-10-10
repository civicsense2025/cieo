// src/primitives/VStack/VStack.tsx
'use client';
/* VStack. Vertical stack: same contract as the shipped Stack primitive, under the HStack/VStack naming. Wraps Stack; no new CSS. */
import { Stack } from '../Stack/Stack.js';
import type { StackProps as VStackProps } from '../Stack/Stack.js';

export { Stack as VStack };
export type { VStackProps };
