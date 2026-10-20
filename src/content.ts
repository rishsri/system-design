import questions from './data/questions.json';
import coreSystems from './data/core-systems.json';
import type { Question } from './types';
export const seed = [...questions,...coreSystems] as Question[];
