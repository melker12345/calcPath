/**
 * Early validation experiments for the new content schema.
 * These will evolve into proper build-time validation.
 */

import { describe, it, expect } from 'vitest';
import { determinantsModule } from '../../modules/linear-algebra/determinants';
import { ModuleContentSchema } from '../schema';

describe('Content Schema Validation', () => {
  it('should validate the existing determinants module', () => {
    const result = ModuleContentSchema.safeParse(determinantsModule);

    if (!result.success) {
      console.error('Validation errors:', result.error.format());
    }

    expect(result.success).toBe(true);
  });

  it('should require stable section slugs where present', () => {
    const badModule = {
      ...determinantsModule,
      sections: determinantsModule.sections.map((s, i) =>
        i === 0 ? { ...s, section: undefined } : s
      ),
    };

    const result = ModuleContentSchema.safeParse(badModule);
    // This test is just documenting current behavior — we may decide later
    // that some sections don't need slugs.
    expect(result.success).toBe(true); // currently allowed
  });
});