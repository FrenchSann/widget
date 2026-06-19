/**
 * Maps axe-core rule IDs to RGAA thematic categories.
 * https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
 */

export const AXE_TO_RGAA: Record<string, string> = {
  // Thématique 1 — Images
  'image-alt': 'Images',
  'image-redundant-alt': 'Images',
  'input-image-alt': 'Images',
  'role-img-alt': 'Images',
  'svg-img-alt': 'Images',

  // Thématique 2 — Cadres
  'frame-title': 'Cadres',
  'frame-focusable-content': 'Cadres',

  // Thématique 3 — Couleurs
  'color-contrast': 'Couleurs',
  'color-contrast-enhanced': 'Couleurs',

  // Thématique 4 — Multimédia (hors scope axe pour le MVP)

  // Thématique 5 — Tableaux
  'td-headers-attr': 'Tableaux',
  'th-has-data-cells': 'Tableaux',
  'table-duplicate-name': 'Tableaux',
  'table-fake-caption': 'Tableaux',
  'scope-attr-valid': 'Tableaux',

  // Thématique 6 — Liens
  'link-name': 'Liens',
  'link-in-text-block': 'Liens',

  // Thématique 7 — Scripts (interactions)
  'aria-allowed-attr': 'Scripts',
  'aria-hidden-focus': 'Scripts',
  'aria-input-field-name': 'Scripts',
  'aria-toggle-field-name': 'Scripts',
  'aria-tooltip-name': 'Scripts',

  // Thématique 8 — Éléments obligatoires
  'html-has-lang': 'Éléments obligatoires',
  'html-lang-valid': 'Éléments obligatoires',
  'html-xml-lang-mismatch': 'Éléments obligatoires',
  'document-title': 'Éléments obligatoires',
  'meta-viewport': 'Éléments obligatoires',
  'meta-refresh': 'Éléments obligatoires',

  // Thématique 9 — Structure
  'landmark-banner-is-top-level': 'Structure',
  'landmark-complementary-is-top-level': 'Structure',
  'landmark-contentinfo-is-top-level': 'Structure',
  'landmark-main-is-top-level': 'Structure',
  'landmark-no-duplicate-banner': 'Structure',
  'landmark-no-duplicate-contentinfo': 'Structure',
  'landmark-no-duplicate-main': 'Structure',
  'landmark-one-main': 'Structure',
  'region': 'Structure',
  'bypass': 'Structure',
  'heading-order': 'Structure',
  'p-as-heading': 'Structure',

  // Thématique 10 — Présentation
  'css-orientation-lock': 'Présentation',
  'scrollable-region-focusable': 'Présentation',
  'target-size': 'Présentation',

  // Thématique 11 — Formulaires
  'label': 'Formulaires',
  'label-content-name-mismatch': 'Formulaires',
  'select-name': 'Formulaires',
  'autocomplete-valid': 'Formulaires',

  // Thématique 12 — Navigation
  'skip-link': 'Navigation',

  // Thématique 13 — Consultation (focus / clavier)
  'focus-trap': 'Consultation',
  'focus-order-semantics': 'Consultation',
  'tabindex': 'Consultation',
  'accesskeys': 'Consultation',

  // ARIA
  'aria-allowed-role': 'ARIA',
  'aria-command-name': 'ARIA',
  'aria-dialog-name': 'ARIA',
  'aria-hidden-body': 'ARIA',
  'aria-meter-name': 'ARIA',
  'aria-progressbar-name': 'ARIA',
  'aria-required-attr': 'ARIA',
  'aria-required-children': 'ARIA',
  'aria-required-parent': 'ARIA',
  'aria-roledescription': 'ARIA',
  'aria-roles': 'ARIA',
  'aria-valid-attr': 'ARIA',
  'aria-valid-attr-value': 'ARIA',
}

export function getRgaaTheme(axeRuleId: string): string {
  return AXE_TO_RGAA[axeRuleId] ?? 'Autre'
}
