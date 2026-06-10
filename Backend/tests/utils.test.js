const { buildVCard } = require('../src/utils/vcard')
const { calculateCompleteness, getCompletenessLevel } = require('../src/utils/completeness')

describe('Utils', () => {
  it('buildVCard escapes special characters', () => {
    const vcard = buildVCard(
      {
        full_name: 'Rajan; Kshedal',
        job_title: 'Developer',
        company: 'NCIT',
        phone: '+977-9800000000',
        public_email: 'rajan@example.com',
      },
      'rajan'
    )

    expect(vcard).toContain('BEGIN:VCARD')
    expect(vcard).toContain('END:VCARD')
    expect(vcard).toContain('VERSION:3.0')
  })

  it('calculateCompleteness returns score and missing fields', () => {
    const result = calculateCompleteness({
      full_name: 'Rajan',
      job_title: 'Dev',
    })

    expect(result.score).toBe(25)
    expect(result.missing).toContain('bio')
  })

  it('getCompletenessLevel maps score to level', () => {
    expect(getCompletenessLevel(30)).toBe('Incomplete')
    expect(getCompletenessLevel(65)).toBe('Moderate')
    expect(getCompletenessLevel(95)).toBe('Complete')
  })
})
