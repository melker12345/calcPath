import { describe, it, expect } from 'vitest';
import { modules as calculusModules } from './modules';
import { modules as linalgModules } from './linalg-modules';
import { modules as statisticsModules } from './statistics-modules';
import { topics as calculusTopics } from './calculus-content';
import { topics as linalgTopics } from './linalg-content';
import { topics as statisticsTopics } from './statistics-content';
import type { Topic } from './shared-types';
import type { ModuleContent } from './modules/types';

type Violation = {
  subject: string;
  topicId: string;
  field: string;
  match: string;
  context: string;
};

function collectTextFromModule(module: ModuleContent): Array<{ field: string; text: string }> {
  const items: Array<{ field: string; text: string }> = [];

  const push = (field: string, text?: string | string[]) => {
    if (!text) return;
    if (Array.isArray(text)) {
      text.forEach((t, i) => items.push({ field: `${field}[${i}]`, text: t }));
    } else {
      items.push({ field, text });
    }
  };

  push('title', module.title);
  push('intro', module.intro);

  module.sections?.forEach((section, sIdx) => {
    push(`sections[${sIdx}].title`, section.title);
    push(`sections[${sIdx}].body`, section.body);
    push(`sections[${sIdx}].eli5`, section.eli5);
    section.examples?.forEach((ex, exIdx) => {
      push(`sections[${sIdx}].examples[${exIdx}].title`, ex.title);
      push(`sections[${sIdx}].examples[${exIdx}].steps`, ex.steps);
    });
  });

  push('examples', module.examples?.flatMap(e => [e.title, ...(e.steps || [])]));
  push('commonMistakes', module.commonMistakes);

  return items;
}

function findSpacingViolations(text: string): string[] {
  // Primary pattern the user cares about: ".The", ".Classic", etc.
  // Also catches many other missing spaces after periods before capitals.
  return text.match(/\.[A-Z]/g) || [];
}

function checkSubject(
  subjectName: string,
  modules: ModuleContent[],
  topics: Topic[]
): Violation[] {
  const violations: Violation[] = [];

  // Check module content (the heavy text)
  modules.forEach((mod) => {
    const texts = collectTextFromModule(mod);
    texts.forEach(({ field, text }) => {
      findSpacingViolations(text).forEach((match) => {
        const idx = text.indexOf(match);
        const start = Math.max(0, idx - 30);
        const end = Math.min(text.length, idx + 30);
        const context = text.slice(start, end).replace(/\s+/g, ' ').trim();

        violations.push({
          subject: subjectName,
          topicId: mod.topicId,
          field,
          match,
          context: `...${context}...`,
        });
      });
    });
  });

  // Also check high-level topic descriptions
  topics.forEach((topic) => {
    if (topic.description) {
      findSpacingViolations(topic.description).forEach((match) => {
        const idx = topic.description.indexOf(match);
        const start = Math.max(0, idx - 30);
        const end = Math.min(topic.description.length, idx + 30);
        const context = topic.description.slice(start, end).replace(/\s+/g, ' ').trim();

        violations.push({
          subject: subjectName,
          topicId: topic.id,
          field: 'topic.description',
          match,
          context: `...${context}...`,
        });
      });
    }
  });

  return violations;
}

describe('Content Spacing Validation', () => {
  it('should have a space after every period before an uppercase letter across all subjects', () => {
    const allViolations = [
      ...checkSubject('calculus', calculusModules, calculusTopics),
      ...checkSubject('linear-algebra', linalgModules, linalgTopics),
      ...checkSubject('statistics', statisticsModules, statisticsTopics),
    ];

    if (allViolations.length > 0) {
      const report = allViolations
        .map(
          (v) =>
            `[${v.subject} / ${v.topicId}] ${v.field}\n   Found: "${v.match}"\n   Context: ${v.context}`
        )
        .join('\n\n');

      console.error('\n=== SPACING VIOLATIONS DETECTED ===\n' + report + '\n');
      expect(allViolations, `Found ${allViolations.length} spacing issues after periods`).toHaveLength(0);
    } else {
      console.log('\n✅ Content Spacing Validation passed — no ".X" (period + uppercase) issues found across all subjects.\n');
    }

    expect(allViolations).toHaveLength(0);
  });
});
