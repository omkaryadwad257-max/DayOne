/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningBite {
  topic: string;
  category: string;
  explanation: string;
  takeaway: string[];
  quiz: Quiz;
}

export interface UserProgress {
  topicCount: number;
  completedQuizzes: number;
  streak: number;
  lastActive: string; // ISO String or Date
}

export interface FocusItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}
