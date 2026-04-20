# MVP

## Goal
Build a refined, high-performance version of the site with the lowest possible friction for learning math.

The product should do only what is necessary for the core learning experience:
- read course material
- practice questions
- submit answers
- receive immediate feedback
- use a scratchpad
- search content
- save progress locally

Everything else should be treated as optional and excluded unless it directly supports this flow.

## Core Purpose
The site exists to help a user:
1. choose a subject
2. read the lesson material for a topic
3. practice the topic
4. submit an answer
5. get feedback immediately
6. continue where they left off

If a feature does not clearly improve one of those steps, it should not be in the MVP.

## Strict Performance Requirement
- No page should be larger than `14 KB`.
- This is a hard requirement, not a guideline.
- Rendering time, hydration cost, and bundle size must be treated as first-class constraints.
- Prefer server-rendered, static, and minimal pages wherever possible.
- Avoid unnecessary client-side state, heavy libraries, visual effects, and abstractions.

## Required Features

### 1. Subjects And Topics
- The user must be able to access the available subjects.
- Each subject must expose its topics clearly.
- Navigation between subjects, topics, lesson material, and practice must be fast and simple.

### 2. Course Material Reading
- The user must be able to read the lesson/module content for each topic.
- Lesson pages should be minimal, readable, and optimized for fast loading.
- Only the content needed for the current topic should be loaded.

### 3. Practice Flow
- The user must be able to open practice for a topic.
- The user must be able to enter an answer with minimal friction.
- The user must be able to submit an answer.
- The system must immediately show whether the answer is correct or incorrect.

### 4. Feedback
- Feedback must be immediate and easy to understand.
- The result should clearly communicate success, failure, and any essential explanation.
- Feedback should not require complex animations or heavy UI.

### 5. Scratchpad
- The user must be able to open a scratchpad while solving.
- Scratchpad drawings should persist while the user is on the current question.
- Scratch pad should allow the user to draw quick calculation - whilst still seeing the question.
- Scratchpad data should be cleared once the user has answered and moved on from that question.

### 6. Search
- The user must be able to search subjects, topics, and relevant content.
- Search should be fast and lightweight.
- Search should load only when needed if possible.

### 7. Progress Saving
- The user must be able to keep progress in local storage.
- Saved progress should include the essentials needed to continue learning without friction.
- Progress persistence should be simple, reliable, and cheap to read/write.

### 8. Responsive Use
- The essential learning flow must work on desktop and mobile.
- Reading, practicing, submitting, feedback, and scratchpad access must all remain usable on small screens.

## What Should Be Removed From The MVP
- decorative or heavily themed UI
- unnecessary animations
- visual polish that increases bundle size or render cost
- duplicated components and abstractions with little product value
- features that do not directly support reading, practicing, feedback, search, or progress
- anything that makes a page heavier without improving the core learning loop

## Product Principles
- minimal UI
- fast first load
- low hydration
- low JavaScript
- low rendering cost
- low interaction friction
- content first
- mobile-friendly by default

## Engineering Principles
- prefer simple components over abstract component systems
- prefer server rendering and static output where possible
- load only what is needed for the current page
- avoid global client state unless it is essential
- avoid large dependencies
- optimize for perceived speed and actual bundle size
- keep the architecture understandable and easy to maintain

## MVP Test
The MVP is successful if a user can:
1. open the site quickly
2. choose a subject and topic
3. read the material
4. practice the topic
5. use the scratchpad if needed
6. submit an answer and get feedback
7. leave and come back without losing local progress

