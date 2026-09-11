/**
 * Editable structure for the designed static pages. Drives the extra fields the
 * CMS shows under the Body editor for a given slug. Pages without an entry here
 * just get Title + Body + SEO.
 */

export type PageFieldKind = 'text' | 'textarea' | 'list' | 'repeater' | 'group';

export interface PageField {
  key: string;
  label: string;
  kind: PageFieldKind;
  help?: string;
  placeholder?: string;
  /** repeater / group: sub-fields (text | textarea only) */
  fields?: PageField[];
  addLabel?: string;
}

export interface PageSection {
  title: string;
  fields: PageField[];
}

const CTA: PageField = {
  key: 'cta',
  label: '',
  kind: 'group',
  fields: [
    { key: 'heading', label: 'Heading', kind: 'text' },
    { key: 'body', label: 'Body', kind: 'textarea' },
    { key: 'buttonLabel', label: 'Button label', kind: 'text' },
    { key: 'href', label: 'Button link', kind: 'text', placeholder: '/subscribe' },
  ],
};

export const PAGE_SCHEMAS: Record<string, PageSection[]> = {
  about: [
    {
      title: 'Hero',
      fields: [
        {
          key: 'heroLede',
          label: 'Lede',
          kind: 'textarea',
          help: 'One or two sentences shown under the page title.',
        },
        {
          key: 'quickFacts',
          label: 'Quick facts',
          kind: 'list',
          help: 'Short phrases shown as a dot-separated strip.',
        },
      ],
    },
    {
      title: 'What we cover',
      fields: [
        { key: 'coverHeading', label: 'Heading', kind: 'text' },
        { key: 'coverIntro', label: 'Intro', kind: 'textarea' },
        {
          key: 'coverItems',
          label: 'Cards',
          kind: 'repeater',
          addLabel: 'Add card',
          fields: [
            { key: 'label', label: 'Label', kind: 'text' },
            { key: 'desc', label: 'Description', kind: 'text' },
            { key: 'href', label: 'Link', kind: 'text', placeholder: '/restaurants' },
          ],
        },
        { key: 'coverFootnote', label: 'Footnote', kind: 'text' },
      ],
    },
    {
      title: 'How we pick',
      fields: [
        { key: 'principlesHeading', label: 'Heading', kind: 'text' },
        {
          key: 'principles',
          label: 'Principles',
          kind: 'repeater',
          addLabel: 'Add principle',
          fields: [
            { key: 'title', label: 'Title', kind: 'text' },
            { key: 'body', label: 'Body', kind: 'textarea' },
          ],
        },
      ],
    },
    {
      title: 'By the numbers',
      fields: [
        {
          key: 'stats',
          label: 'Stats',
          kind: 'repeater',
          addLabel: 'Add stat',
          fields: [
            { key: 'value', label: 'Value', kind: 'text' },
            { key: 'label', label: 'Label', kind: 'text' },
            { key: 'sub', label: 'Caption', kind: 'text' },
          ],
        },
      ],
    },
    { title: 'Call to action', fields: [CTA] },
  ],

  'work-with-us': [
    {
      title: 'Hero',
      fields: [{ key: 'heroLede', label: 'Lede', kind: 'textarea' }],
    },
    {
      title: 'Ways to work together',
      fields: [
        { key: 'lanesHeading', label: 'Heading', kind: 'text' },
        {
          key: 'lanes',
          label: 'Lanes',
          kind: 'repeater',
          addLabel: 'Add lane',
          fields: [
            { key: 'label', label: 'Label', kind: 'text' },
            { key: 'desc', label: 'Description', kind: 'textarea' },
            { key: 'action', label: 'Action text', kind: 'text' },
            { key: 'href', label: 'Link', kind: 'text', placeholder: '/contact or mailto:…' },
            { key: 'note', label: 'Badge (optional)', kind: 'text', placeholder: 'Free' },
          ],
        },
        { key: 'contactEmail', label: 'Contact email', kind: 'text' },
      ],
    },
    { title: 'Call to action', fields: [CTA] },
  ],
};
