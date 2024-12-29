"server-only";

import {
  relations,
  sql,
  eq,
  ne,
  and,
  inArray,
  isNotNull,
  lte,
} from "drizzle-orm";
import {
  pgTable,
  integer,
  boolean,
  jsonb,
  pgMaterializedView,
  foreignKey,
  text,
  unique,
  decimal,
} from "drizzle-orm/pg-core";
import {
  entry,
  gloss,
  kanaText,
  kanji,
  kanjiText,
  meaning,
  reading,
  sense,
} from "@/server/db/schema/ichiran";
import { jsonAggBuildObject } from "@/server/db/utils";
import { type IchiranResponse } from "@/types/ichiran";

export const manga = pgTable("manga", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").unique().notNull(),
  enName: text("en_name"),
  jpName: text("jp_name"),
  author: text("author"),
});

export const mangaPage = pgTable(
  "manga_page",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    mangaId: integer("manga_id").notNull(),
    volumeNum: integer("volume_num").notNull(),
    chapterNum: integer("chapter_num"), // TODO make this not null when chapter info is present
    pageNum: integer("page_num").notNull(),
    imgWidth: integer("img_width").notNull(),
    imgHeight: integer("img_height").notNull(),
  },
  (table) => ({
    fk: foreignKey({
      name: "manga_fk",
      columns: [table.mangaId],
      foreignColumns: [manga.id],
    }).onDelete("cascade"),
    unq: unique()
      .on(table.mangaId, table.volumeNum, table.chapterNum, table.pageNum)
      .nullsNotDistinct(),
  }),
);

export const speechBubble = pgTable(
  "speech_bubble",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    mangaPageId: integer("manga_page_id").notNull(),
    blockNum: integer("block_num").notNull(),
    box: jsonb("box").notNull().$type<[number, number, number, number]>(),
    vertical: boolean("vertical").notNull(),
    fontSize: decimal("font_size").notNull(),
    lineCoords: jsonb("line_coords").notNull().$type<[number, number][][]>(),
    lines: jsonb("lines").notNull().$type<string[]>(),
    segmentation: jsonb("segmentation").$type<IchiranResponse>(), // Word-by-word glossary (ichiran)
    kanji: jsonb("kanji").$type<string[]>(), // JSON array of kanji from lines of text
  },
  (table) => ({
    fk: foreignKey({
      name: "manga_page_fk",
      columns: [table.mangaPageId],
      foreignColumns: [mangaPage.id],
    }).onDelete("cascade"),
  }),
);

export const mangaRelations = relations(manga, ({ many }) => ({
  pages: many(mangaPage),
}));

export const mangaPageRelations = relations(mangaPage, ({ one, many }) => ({
  manga: one(manga, {
    fields: [mangaPage.mangaId],
    references: [manga.id],
  }),
  speechBubbles: many(speechBubble),
}));

export const speechBubbleRelations = relations(speechBubble, ({ one }) => ({
  mangaPage: one(mangaPage, {
    fields: [speechBubble.mangaPageId],
    references: [mangaPage.id],
  }),
}));

export const kanjiDetail = pgMaterializedView("kanji_detail").as((qb) => {
  const uniqueKanji = qb.$with("unique_kanji").as(
    qb
      .selectDistinct({
        kanji: sql`jsonb_array_elements_text(${speechBubble.kanji})`.as(
          "kanji",
        ),
      })
      .from(speechBubble),
  );
  const selectUniqueKanji = qb.select().from(uniqueKanji);
  const uniqueKanjiRegex = qb.$with("unique_kanji_regex").as(
    qb
      .select({
        pattern: sql`string_agg(${uniqueKanji.kanji},  '|')`.as("pattern"),
      })
      .from(uniqueKanji),
  );
  const selectUniqueKanjiRegex = qb.select().from(uniqueKanjiRegex);
  const readings = qb.$with("readings").as(
    qb
      .select({
        id: kanji.id,
        readings: jsonAggBuildObject(
          {
            kana: reading.text,
            type: reading.type,
            numWords: reading.statCommon,
            perc: sql<number>`(${reading.statCommon} * 100.0 / NULLIF(${kanji.statCommon}, 0))`,
          },
          { orderBy: { colName: reading.statCommon, direction: "DESC" } },
        ).as("readings"),
      })
      .from(kanji)
      .innerJoin(reading, eq(kanji.id, reading.kanjiId))
      .where(
        and(ne(reading.type, "ja_na"), inArray(kanji.text, selectUniqueKanji)),
      )
      .groupBy(kanji.id),
  );
  const meanings = qb.$with("meanings").as(
    qb
      .select({
        id: kanji.id,
        meanings: sql<
          string[]
        >`json_agg(${meaning.text} ORDER BY ${meaning.id})`.as("meanings"),
      })
      .from(kanji)
      .leftJoin(meaning, eq(kanji.id, meaning.kanjiId))
      .where(inArray(kanji.text, selectUniqueKanji))
      .groupBy(kanji.id),
  );

  const commonWordsRaw = qb.$with("common_words_raw").as(
    qb
      .select({
        seq: kanjiText.seq,
        ord: sense.ord,
        common: kanjiText.common,
        text: kanjiText.text,
        kana: sql<string>`${kanaText.text}`.as("kana"),
        kanji: sql<
          string[]
        >`unnest(regexp_matches(${kanjiText.text}, ${selectUniqueKanjiRegex}, 'g'))`.as(
          "kanji",
        ),
        gloss: sql<
          string[]
        >`string_agg(${gloss.text}, '; ' ORDER BY ${gloss.ord})`.as("gloss"),
      })
      .from(gloss)
      .innerJoin(sense, eq(sense.id, gloss.senseId))
      .innerJoin(entry, eq(sense.seq, entry.seq))
      .innerJoin(kanjiText, eq(sense.seq, kanjiText.seq))
      .innerJoin(kanaText, eq(sense.seq, kanaText.seq))
      .where(
        and(
          eq(kanaText.text, kanjiText.bestKana),
          isNotNull(kanjiText.common),
          eq(entry.rootP, true),
          sql`${kanjiText.text} ~ ${selectUniqueKanjiRegex}`,
        ),
      )
      .groupBy(
        kanjiText.seq,
        kanjiText.text,
        kanaText.text,
        kanjiText.common,
        sense.ord,
      ),
  );

  const aggregatedCommonWords = qb.$with("aggregated_common_words").as(
    qb
      .select({
        seq: commonWordsRaw.seq,
        text: commonWordsRaw.text,
        kana: commonWordsRaw.kana,
        common: commonWordsRaw.common,
        kanji: commonWordsRaw.kanji,
        wordNum: sql<number>`row_number() OVER (
          PARTITION BY ${commonWordsRaw.kanji} 
          ORDER BY ${commonWordsRaw.common} = 0, ${commonWordsRaw.common}, ${commonWordsRaw.seq})`.as(
          "wordNum",
        ),
        gloss: sql<
          string[]
        >`json_agg(${commonWordsRaw.gloss} ORDER BY ${commonWordsRaw.ord})`.as(
          "gloss",
        ),
      })
      .from(commonWordsRaw)
      .groupBy(
        commonWordsRaw.seq,
        commonWordsRaw.text,
        commonWordsRaw.kana,
        commonWordsRaw.common,
        commonWordsRaw.kanji,
      ),
  );

  const topCommonWords = qb.$with("top_common_words").as(
    qb
      .select({
        kanji: aggregatedCommonWords.kanji,
        commonWords: sql<
          {
            seq: number;
            text: string;
            kana: string;
            common: number;
            kanji: string;
            wordNum: number;
            gloss: string[];
          }[]
        >`json_agg(${aggregatedCommonWords})`.as("commonWords"),
      })
      .from(aggregatedCommonWords)
      .where(lte(aggregatedCommonWords.wordNum, 10))
      .groupBy(aggregatedCommonWords.kanji),
  );

  return qb
    .with(
      uniqueKanji,
      uniqueKanjiRegex,
      readings,
      meanings,
      commonWordsRaw,
      aggregatedCommonWords,
      topCommonWords,
    )
    .select({
      id: kanji.id,
      text: kanji.text,
      freq: kanji.freq,
      grade: kanji.grade,
      strokes: kanji.strokes,
      totalWords: kanji.statCommon,
      readings: readings.readings,
      meanings: meanings.meanings,
      commonWords: topCommonWords.commonWords,
    })
    .from(kanji)
    .innerJoin(meanings, eq(kanji.id, meanings.id))
    .innerJoin(readings, eq(kanji.id, readings.id))
    .innerJoin(topCommonWords, eq(kanji.text, topCommonWords.kanji));
});
