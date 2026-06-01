/**
 * Early validation experiments for the new content schema.
 * These will evolve into proper build-time validation.
 */

import { describe, it, expect } from 'vitest';
import { determinantsModule } from '../../modules/linear-algebra/determinants';
import { ModuleContentSchema, FileSystemContentBundleSchema } from '../schema';
import { loadLinearAlgebraFromContent, getFileSystemContentBundle } from '../loader';

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

describe('Filesystem Content Loader (JSON + MDX per ARCHITECTURE.md)', () => {
  it('should load Linear Algebra metadata + full topics from content/ dir', async () => {
    const bundle = await loadLinearAlgebraFromContent();

    expect(bundle.config.slug).toBe('linear-algebra');
    expect(bundle.config.label).toBe('Linear Algebra');
    expect(bundle.topics.length).toBe(9); // full LA

    const vectors = bundle.topics.find(t => t.id === 'vectors');
    expect(vectors).toBeDefined();
    expect(vectors?.title).toContain('Vectors');

    // Now full data: ~336 problems + 9 mdxModules (one per topic)
    expect(bundle.problems.length).toBeGreaterThan(300);
    expect(bundle.mdxModules.length).toBe(9);
    expect(bundle.mdxModules.some(m => m.topicId === 'vectors')).toBe(true);
    const vectorsMdx = bundle.mdxModules.find(m => m.topicId === 'vectors')!;
    expect(vectorsMdx.mdxSource).toContain('Vectors and Euclidean Spaces');
    expect(vectorsMdx.mdxSource).toContain('ELI5');

    // Full roundtrip validation
    const validated = FileSystemContentBundleSchema.parse(bundle);
    expect(validated).toEqual(bundle);
  });

  it('should expose via getFileSystemContentBundle and reject other slugs', async () => {
    const la = await getFileSystemContentBundle('linear-algebra');
    expect(la.config.slug).toBe('linear-algebra');

    await expect(getFileSystemContentBundle('calculus')).rejects.toThrow(/supports only "linear-algebra" and "statistics"/);
  });
});
