import dedent from 'dedent-js';
import { KeywordMode } from '../../src/types';
import { FormatFn, SqlLanguage } from '../../src/sqlFormatter';

export default function supportsKeywordPositions(language: SqlLanguage, format: FormatFn) {
  const baseQuery = `
    SELECT COUNT(a.column1), MAX(b.column2 + b.column3), b.column4 AS four
    FROM ( SELECT column1, column5 FROM table1 ) a
    JOIN table2 b ON a.column5 = b.column5
    WHERE column6 AND column7
    GROUP BY column4;
  `;

  it('supports standard mode', () => {
    const result = format(baseQuery, { keywordPosition: KeywordMode.standard });
    expect(result).toBe(dedent`
      SELECT
        COUNT(a.column1),
        MAX(b.column2 + b.column3),
        b.column4 AS four
      FROM
      (
        SELECT
          column1,
          column5
        FROM
          table1
      ) a
      JOIN table2 b
      ON a.column5 = b.column5
      WHERE
        column6
        AND column7
      GROUP BY
        column4;
    `);
  });

  describe('keywordPosition: tenSpaceLeft', () => {
    it('aligns command keywords to left', () => {
      const result = format(baseQuery, { keywordPosition: KeywordMode.tenSpaceLeft });
      expect(result).toBe(dedent`
        SELECT    COUNT(a.column1),
                  MAX(b.column2 + b.column3),
                  b.column4 AS four
        FROM      (
                  SELECT    column1,
                            column5
                  FROM      table1
                  ) a
        JOIN      table2 b
        ON        a.column5 = b.column5
        WHERE     column6
        AND       column7
        GROUP BY  column4;
      `);
    });

    it('handles long keywords', () => {
      expect(
        format(
          dedent`
            SELECT *
            FROM a
            UNION DISTINCT
            SELECT *
            FROM b
            LEFT OUTER JOIN c;
          `,
          { keywordPosition: KeywordMode.tenSpaceLeft }
        )
      ).toBe(dedent`
        SELECT    *
        FROM      a
        UNION     DISTINCT
        SELECT    *
        FROM      b
        LEFT      OUTER JOIN c;
      `);
    });
  });

  describe('keywordPosition: tenSpaceRight', () => {
    it('aligns command keywords to right', () => {
      const result = format(baseQuery, { keywordPosition: KeywordMode.tenSpaceRight });
      expect(result).toBe(
        [
          '   SELECT COUNT(a.column1),',
          '          MAX(b.column2 + b.column3),',
          '          b.column4 AS four',
          '     FROM (',
          '             SELECT column1,',
          '                    column5',
          '               FROM table1',
          '          ) a',
          '     JOIN table2 b',
          '       ON a.column5 = b.column5',
          '    WHERE column6',
          '      AND column7',
          ' GROUP BY column4;',
        ].join('\n')
      );
    });

    it('handles long keywords', () => {
      expect(
        format(
          dedent`
            SELECT *
            FROM a
            UNION DISTINCT
            SELECT *
            FROM b
            LEFT OUTER JOIN c;
          `,
          { keywordPosition: KeywordMode.tenSpaceRight }
        )
      ).toBe(
        [
          '   SELECT *',
          '     FROM a',
          '    UNION DISTINCT',
          '   SELECT *',
          '     FROM b',
          '     LEFT OUTER JOIN c;',
        ].join('\n')
      );
    });
  });
}