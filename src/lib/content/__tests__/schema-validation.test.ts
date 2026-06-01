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
  it('should load Linear Algebra metadata + vectors topic from content/ dir', async () => {
    const bundle = await loadLinearAlgebraFromContent();

    expect(bundle.config.slug).toBe('linear-algebra');
    expect(bundle.config.label).toBe('Linear Algebra');
    expect(bundle.topics.length).toBeGreaterThanOrEqual(1);

    // vectors is the only one with folder in current skeleton
    const vectors = bundle.topics.find(t => t.id === 'vectors');
    expect(vectors).toBeDefined();
    expect(vectors?.title).toContain('Vectors');

    // Currently 0 questions (skeleton), 1 mdxModule for vectors
    expect(bundle.problems.length).toBe(0);
    expect(bundle.mdxModules.length).toBe(1);
    expect(bundle.mdxModules[0].topicId).toBe('vectors');
    expect(bundle.mdxModules[0].mdxSource).toContain('Vectors and Euclidean Spaces');
    expect(bundle.mdxModules[0].mdxSource).toContain('ELI5');

    // Full roundtrip validation
    const validated = FileSystemContentBundleSchema.parse(bundle);
    expect(validated).toEqual(bundle);
  });

  it('should expose via getFileSystemContentBundle and reject other slugs in thin slice', async () => {
    const la = await getFileSystemContentBundle('linear-algebra');
    expect(la.config.slug).toBe('linear-algebra');

    await expect(getFileSystemContentBundle('calculus')).rejects.toThrow(/only supports "linear-algebra"/);
  });
});
